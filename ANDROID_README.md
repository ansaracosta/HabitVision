# Guia para Gerar o APK do HabiTracker

O projeto Android já está configurado na pasta `android/` com todos os arquivos necessários.

## Pré-requisitos (no seu computador)

1. **Android Studio** — baixe em https://developer.android.com/studio
2. **JDK 17** (já vem incluído no Android Studio)

---

## Passo 1 — Baixar o projeto do Replit

No Replit, clique nos **3 pontinhos (...)** no menu superior → **Download as zip**

Extraia o arquivo ZIP no seu computador.

---

## Passo 2 — Abrir no Android Studio

1. Abra o **Android Studio**
2. Clique em **Open**
3. Navegue até a pasta extraída e selecione a subpasta **`android/`**
4. Aguarde o Gradle sincronizar (pode levar alguns minutos na primeira vez)

---

## Passo 3 — Gerar o APK de teste (debug)

1. No Android Studio, vá em **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Aguarde o build finalizar
3. Clique em **"locate"** na notificação que aparecer no canto inferior direito
4. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Passo 4 — Instalar no celular

**Opção A — Pelo arquivo APK (mais fácil):**
1. Copie o `app-debug.apk` para o celular (via cabo, WhatsApp, Google Drive, etc.)
2. No celular, abra o arquivo e toque em **Instalar**
3. Se aparecer um aviso, vá em **Configurações → Segurança → Fontes desconhecidas** e permita

**Opção B — Pelo Android Studio (cabo USB):**
1. Ative o **Modo Desenvolvedor** no celular:
   Configurações → Sobre o telefone → toque **7 vezes** em "Número da versão"
2. Ative **Depuração USB** nas opções de desenvolvedor
3. Conecte o celular ao computador via USB
4. No Android Studio, clique no botão ▶️ **Run** para instalar diretamente

---

## Atualizar o app após mudanças no Replit

Sempre que alterar o código no Replit, execute no terminal:

```bash
./android-build.sh
```

Depois baixe o ZIP novamente, substitua os arquivos e no Android Studio faça:
**File → Sync Project with Gradle Files** antes de buildar novamente.

---

## Gerar APK assinado (para distribuição / Play Store)

1. **Build → Generate Signed Bundle / APK**
2. Escolha **APK**
3. Crie ou selecione uma **keystore** (guarde esse arquivo com segurança!)
4. Escolha a variante **release**
5. O APK assinado ficará em `android/app/build/outputs/apk/release/`

---

## Solução de Problemas

- **Gradle falhou**: clique em **File → Invalidate Caches → Restart**
- **Erro de SDK**: vá em **File → Project Structure → SDK Location** e configure o caminho correto
- **App não instala**: certifique-se de ter habilitado "Instalar apps de fontes desconhecidas" no celular
