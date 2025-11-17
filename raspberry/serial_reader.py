import serial
import requests
import json
import threading
import time
import logging
from datetime import datetime
from queue import Queue
import config

logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format=config.LOG_FORMAT,
    handlers=[
        logging.FileHandler(config.LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

leituras_pendentes = Queue(maxsize=config.BUFFER_SIZE)

class ArduinoReader:
    
    def __init__(self, arduino_config):
        self.config = arduino_config
        self.porta = arduino_config['porta']
        self.zona = arduino_config['zona']
        self.baudrate = arduino_config['baudrate']
        self.timeout = arduino_config['timeout']
        self.nome = arduino_config['nome']
        self.serial_conn = None
        self.running = False
        
    def conectar(self):
        try:
            self.serial_conn = serial.Serial(
                port=self.porta,
                baudrate=self.baudrate,
                timeout=self.timeout
            )
            logger.info(f"✅ {self.nome} conectado em {self.porta}")
            return True
        except serial.SerialException as e:
            logger.error(f"❌ Erro ao conectar {self.nome}: {e}")
            return False
    
    def desconectar(self):
        if self.serial_conn and self.serial_conn.is_open:
            self.serial_conn.close()
            logger.info(f"🔌 {self.nome} desconectado")
    
    def processar_linha(self, linha):
        try:
            linha = linha.strip()
            
            if not linha.startswith("DATA:"):
                if config.DEBUG_MODE:
                    logger.debug(f"[{self.nome}] Mensagem: {linha}")
                return None
            
            dados_str = linha[5:]
            dados_dict = {}
            
            for item in dados_str.split(","):
                if "=" in item:
                    chave, valor = item.split("=", 1)
                    dados_dict[chave.strip()] = valor.strip()
            
            leitura = {
                'zona': int(dados_dict.get('ZONA', self.zona)),
                'tipo_animal': dados_dict.get('TIPO', 'DESCONHECIDO'),
                'uid': dados_dict.get('UID', ''),
                'count': int(dados_dict.get('COUNT', 0)),
                'timestamp': datetime.now().isoformat(),
                'arduino': self.nome
            }
            
            logger.info(f"📡 [{self.nome}] {leitura['tipo_animal']} detectada - UID: {leitura['uid']}")
            return leitura
            
        except Exception as e:
            logger.error(f"❌ Erro ao processar linha do {self.nome}: {e}")
            logger.debug(f"Linha problemática: {linha}")
            return None
    
    def iniciar_leitura(self):
        self.running = True
        
        while self.running:
            try:
                if not self.serial_conn or not self.serial_conn.is_open:
                    if not self.conectar():
                        logger.warning(f"⏳ Tentando reconectar {self.nome} em {config.RECONNECT_DELAY}s...")
                        time.sleep(config.RECONNECT_DELAY)
                        continue
                
                if self.serial_conn.in_waiting > 0:
                    linha = self.serial_conn.readline().decode('utf-8', errors='ignore')
                    leitura = self.processar_linha(linha)
                    
                    if leitura:
                        try:
                            leituras_pendentes.put_nowait(leitura)
                        except:
                            logger.warning(f"⚠️ Fila cheia! Leitura descartada.")
                
                time.sleep(0.1)  
                
            except serial.SerialException as e:
                logger.error(f"❌ Erro serial no {self.nome}: {e}")
                self.desconectar()
                time.sleep(config.RECONNECT_DELAY)
                
            except Exception as e:
                logger.error(f"❌ Erro inesperado no {self.nome}: {e}")
                time.sleep(1)
    
    def parar(self):
        self.running = False
        self.desconectar()

class BackendSender:
    
    def __init__(self):
        self.running = False
        self.backup_local = []
    
    def enviar_leitura(self, leitura):
        try:
            headers = {'Content-Type': 'application/json'}
            
            if config.API_KEY:
                headers['Authorization'] = f"Bearer {config.API_KEY}"
            
            response = requests.post(
                config.BACKEND_ENDPOINTS['leituras'],
                json=leitura,
                headers=headers,
                timeout=5
            )
            
            if response.status_code == 200 or response.status_code == 201:
                logger.info(f"✅ Leitura enviada: Zona {leitura['zona']} - {leitura['tipo_animal']}")
                return True
            else:
                logger.warning(f"⚠️ Backend retornou status {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Erro ao enviar para backend: {e}")
            return False
    
    def salvar_backup_local(self, leitura):
        if config.SAVE_LOCAL_BACKUP:
            try:
                self.backup_local.append(leitura)
                with open(config.LOCAL_BACKUP_FILE, 'w') as f:
                    json.dump(self.backup_local, f, indent=2)
                logger.info(f"💾 Leitura salva localmente (backup)")
            except Exception as e:
                logger.error(f"❌ Erro ao salvar backup: {e}")
    
    def processar_fila(self):
        self.running = True
        
        while self.running:
            try:
                if not leituras_pendentes.empty():
                    leitura = leituras_pendentes.get()
                    
                    sucesso = False
                    for tentativa in range(config.MAX_RETRY_ATTEMPTS):
                        if self.enviar_leitura(leitura):
                            sucesso = True
                            break
                        else:
                            if tentativa < config.MAX_RETRY_ATTEMPTS - 1:
                                logger.info(f"🔄 Tentativa {tentativa + 2}/{config.MAX_RETRY_ATTEMPTS}")
                                time.sleep(2)
                    
                    if not sucesso:
                        self.salvar_backup_local(leitura)
                    
                    leituras_pendentes.task_done()
                
                time.sleep(0.5)
                
            except Exception as e:
                logger.error(f"❌ Erro ao processar fila: {e}")
                time.sleep(1)
    
    def parar(self):
        self.running = False


def main():
    logger.info("🚀 Iniciando Sistema de Leitura RFID")
    logger.info(f"📍 Monitorando {len(config.ARDUINOS)} zonas")
    
    readers = []
    threads_leitura = []
    
    for arduino_config in config.ARDUINOS:
        reader = ArduinoReader(arduino_config)
        readers.append(reader)
        
        thread = threading.Thread(target=reader.iniciar_leitura, daemon=True)
        threads_leitura.append(thread)
        thread.start()
    
    sender = BackendSender()
    thread_sender = threading.Thread(target=sender.processar_fila, daemon=True)
    thread_sender.start()
    
    logger.info("✅ Sistema iniciado com sucesso!")
    logger.info("Pressione Ctrl+C para encerrar")
    
    try:
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("\n🛑 Encerrando sistema...")
        
        for reader in readers:
            reader.parar()
        
        sender.parar()
        
        logger.info("👋 Sistema encerrado!")


if __name__ == "__main__":
    main()