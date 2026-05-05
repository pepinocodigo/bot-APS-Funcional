const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")

    const sock = makeWASocket({
        auth: state
    })

    sock.ev.on("creds.update", saveCreds)

    // anti-spam simples
    const cooldown = new Map()
    let lastMsg = {}

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text

        if (!text) return

        // evita repetição de mensagem igual
        if (lastMsg[from] === text) return
        lastMsg[from] = text

        // cooldown (5 segundos por chat)
        if (cooldown.get(from)) return
        cooldown.set(from, true)
        setTimeout(() => cooldown.delete(from), 5000)

        // comando !numero
        if (text === "!numero") {
            await new Promise(r => setTimeout(r, 1000)) // delay humano

            const numero = Math.floor(Math.random() * 100) + 1
            await sock.sendMessage(from, { text: "🔢 Número: " + numero })
        }
    })
}

startBot()
