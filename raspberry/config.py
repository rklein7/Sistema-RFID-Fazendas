ARDUINOS = [
    {
        'porta': '/dev/ttyUSB0',  # Porta USB do Arduino da Zona 1
        'zona': 1,
        'baudrate': 9600,
        'timeout': 1,
        'nome': 'Arduino Zona 1'
    },
    {
        'porta': '/dev/ttyUSB1',  # Porta USB do Arduino da Zona 2
        'zona': 2,
        'baudrate': 9600,
        'timeout': 1,
        'nome': 'Arduino Zona 2'
    }
]

BACKEND_URL = "http://localhost:8000"
BACKEND_ENDPOINTS = {
    'leituras': f"{BACKEND_URL}/api/leituras",
    'status': f"{BACKEND_URL}/api/status"
}

RECONNECT_DELAY = 5  
HEARTBEAT_INTERVAL = 30  

LOG_FILE = '/var/log/rfid_reader.log'
LOG_LEVEL = 'INFO'  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

API_KEY = None  

DEBUG_MODE = True  
SAVE_LOCAL_BACKUP = True  
LOCAL_BACKUP_FILE = './backup_leituras.json'

MAX_RETRY_ATTEMPTS = 3  
BUFFER_SIZE = 100  