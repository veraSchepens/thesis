//Personal API key
const API_key = "tgp_v1_MQ2adXCZV21rs4UY5zIylzdzQeUB3gc6Bzf75bwPYkw"

const chatInput = document.querySelector('.chat-input textarea')
const sendChatBtn = document.querySelector('.chat-input button')
let userMessage

/**
 * Creates a chat list item element with the provided message and class
 * 
 * @param {string} message - The chat message to be displayed
 * @param {string} className - The CSS class indicating the type of message
 * @returns The constructed chat <li> element.
 */

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li")
    chatLi.classList.add("chat", className)
    let chatContent
    if (className === "chat-outgoing") {
        chatContent = `<p class = "outgoing-message">${message}</p>`
    }
    else{
        chatContent = `<p class = "incoming-message">${message}</p>`
    }
    chatLi.innerHTML = chatContent
    return chatLi
}


/**
 * Processes the answer via the API and a vocalized response.
 * 
 * @param {HTMLElement} incomingChatLi - The chat list item element containing the user's message.
 */
const generateResponse = (incomingChatLi) => {
    const API = "https://api.together.xyz/v1/chat/completions"
    const messageElement = incomingChatLi.querySelector("p")

    //Sends an API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_key}`
        },
        body: JSON.stringify({
            "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            "messages": [
                {
                    role: "user",
                    content: "Beantwoord dit in maximaal 100 woorden" + userMessage
                }
            ]
        })
    }

    fetch(API, requestOptions)
        //Checks if the HTTP response was successful.
        .then(res => {
            if (!res.ok) {
                throw new Error("Network response was not ok")
            }
            return res.json()
        })

        .then(data => {
            //Handles the parsed response data.
            console.log(data)
            const responseText = data.choices[0].message.content
            messageElement.textContent = responseText

            /**
             * Converts the text into speech, and triggers eye animations when the speech starts and ends.
             * 
             * @param {string} text - The text to be spoken aloud
             */
            const speakText = (text) => {
                const utterance = new SpeechSynthesisUtterance(text)
                const voices = speechSynthesis.getVoices()
                const dutchVoice = voices.find(voice => voice.name === "Google Nederlands")

                //Chooses a Dutch voice if available, if it's not available it's mentioned in the console.
                if (dutchVoice){
                    utterance.voice = dutchVoice
                } 
                else {
                    console.warn("Google Nederlands stem niet gevonden, gebruik standaard stem.")
                }

                //Sets the voice language to Dutch.
                utterance.lang = "nl-NL"
                speechSynthesis.speak(utterance)
            }

            speakText(responseText)
        })

        //Handles any network errors.
        .catch(() => {
            messageElement.classList.add("error")
            const utterance = new SpeechSynthesisUtterance("Er is iets misgegaan, probeer het opnieuw.")
            speechSynthesis.speak(utterance)
        })
}

//Handles the user submitting a chat message.
const handleChat = () => {
    userMessage = chatInput.value.trim()
    chatInput.value = ""

    if(!userMessage){
        return
    }

    if(userMessage.toLowerCase()==="doei"){
        cancel()
        return
    }

    const incomingChatLi = createChatLi("...", "chat-incoming")
    generateResponse(incomingChatLi)
}

sendChatBtn.addEventListener("click", handleChat)

//All images imported here as frames to use in the eye animations
const neutral_frames = [
    {src: "Assets/eyes_open.png", duration: 1920}]

//Main function for the blinking motion.
const blink = () => {
    const image = document.getElementById("displayed-image")
    const originalSrc = image.src

    setTimeout(() => image.src = "Assets/eyes_half_closed.png", 86)
    setTimeout(() => image.src = "Assets/eyes_closed.png", 143)
    setTimeout(() => image.src = "Assets/eyes_half_closed.png", 286)
    setTimeout(() => image.src = originalSrc, 572)

    const nextBlink = 3500
    setTimeout(blink, nextBlink)
}

let current = 0
let currentFrames = neutral_frames
let animationTimeout

//Loops through frames
function showNextImage() {
    const frame = currentFrames[current]
    document.getElementById("displayed-image").src = frame.src

    current = (current + 1) % currentFrames.length
    animationTimeout = setTimeout(showNextImage, frame.duration)
}

function setEyeAnimation(frames){
    clearTimeout(animationTimeout)
    currentFrames = frames
    current= 0
    showNextImage()
}

window.onload = () => {
    blink()
    setEyeAnimation(neutral_frames)

    speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.getVoices()
    }
}


