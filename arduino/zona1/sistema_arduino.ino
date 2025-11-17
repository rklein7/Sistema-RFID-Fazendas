#include <SPI.h>
#include <MFRC522.h>

#define ZONA_ID 1 

#define RST_PIN 9
#define SS_PIN 10

MFRC522 mfrc522(SS_PIN, RST_PIN);

// 🆔 UIDs dos cartões
byte vaquinha1UID[4] = {0x00, 0x9F, 0x9E, 0xBB};
byte vaquinha2UID[4] = {0xF3, 0x20, 0x97, 0xFE};

byte ovelinha1UID[4] = {0xD3, 0x07, 0x5C, 0x09};
byte ovelinha2UID[4] = {0x33, 0x15, 0x78, 0x09};

int vaquinhaCount = 0;
int ovelinhaCount = 0;

int greenPin = 3;
int redPin = 2;
int buzzerPin = 4;

void setup() {
  pinMode(greenPin, OUTPUT);
  pinMode(redPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();

  Serial.println("Sistema RFID - Zona " + String(ZONA_ID) + " iniciado!");
  Serial.println("Aproxime a Vaquinha 🐂 ou a Ovelinha 🐑...");
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  String uidString = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uidString += "0";
    uidString += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();

  if (isVaquinha(mfrc522.uid.uidByte)) {
    vaquinhaCount++;
    
    Serial.print("DATA:");
    Serial.print("ZONA=");
    Serial.print(ZONA_ID);
    Serial.print(",TIPO=VAQUINHA");
    Serial.print(",UID=");
    Serial.print(uidString);
    Serial.print(",COUNT=");
    Serial.println(vaquinhaCount);

    digitalWrite(greenPin, HIGH);
    digitalWrite(buzzerPin, HIGH);
    delay(1500);
    digitalWrite(greenPin, LOW);
    digitalWrite(buzzerPin, LOW);
  }
  else if (isOvelinha(mfrc522.uid.uidByte)) {
    ovelinhaCount++;
    
    Serial.print("DATA:");
    Serial.print("ZONA=");
    Serial.print(ZONA_ID);
    Serial.print(",TIPO=OVELINHA");
    Serial.print(",UID=");
    Serial.print(uidString);
    Serial.print(",COUNT=");
    Serial.println(ovelinhaCount);

    // Feedback visual/sonoro
    digitalWrite(redPin, HIGH);
    digitalWrite(buzzerPin, HIGH);
    delay(1000);
    digitalWrite(redPin, LOW);
    digitalWrite(buzzerPin, LOW);
  }
  else {
    Serial.println("🚫 Cartão não reconhecido: " + uidString);
    digitalWrite(buzzerPin, HIGH);
    delay(500);
    digitalWrite(buzzerPin, LOW);
  }

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  delay(1000);
}


bool checkUID(byte *uid, byte *validUID) {
  for (byte i = 0; i < 4; i++) {
    if (uid[i] != validUID[i]) return false;
  }
  return true;
}

bool isVaquinha(byte *uid) {
  return checkUID(uid, vaquinha1UID) || checkUID(uid, vaquinha2UID);
}

bool isOvelinha(byte *uid) {
  return checkUID(uid, ovelinha1UID) || checkUID(uid, ovelinha2UID);
}