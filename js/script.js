// Requests to davinci costs 10% of the price of GPT-3.5 per token !!!!
const endpointURL = 'https://api.openai.com/v1/chat/completions';

let home, keyInput, api_key, loader, outputElement, submitButton, inputElement, historyElement, butonElement, styleSelect, backgroundSelect;

window.onload = init;

function init() {
    home = document.querySelector('#home');

    keyInput = document.querySelector('#key');
    loader = document.querySelector('#loader');
    
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = beforeGetMessage;

    inputElement = document.querySelector('#prompt');
    historyElement = document.querySelector('.history');
    butonElement = document.querySelector('button');
    butonElement.onclick = clearInput;

    styleSelect = document.querySelector('#style');
    backgroundSelect = document.querySelector('#background');

    inputElement.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            beforeGetMessage();
        }
        if (inputElement.value != "") {
            submitButton.classList.add('green');
        } else {
            submitButton.classList.remove('green');
        }
    });
}

function clearInput() {
    submitButton.classList.remove('green');
    inputElement.value = '';
}

function beforeGetMessage() {
    api_key = keyInput.value;
    if(api_key != "") {
        home.classList.add('hide');
        loader.classList.remove('hide');
        getMessage();
    } else {
        alert("Please enter your API key");
    }
}

async function getMessage() {

    let prompt = inputElement.value;
    prompt = prompt.toLowerCase();
    
    if (prompt.startsWith('/image ')) {
        prompt = prompt.substr(1);

        let array = prompt.split(" ");
        array = array.filter(item => item.trim() !== "");
        prompt = array.slice(1).join(" ");
        
        console.log("Génrer un prompt pour dall-E à partir de : " + prompt + ". ");

        let request = "Génères un prompt (300 caractères maximum) pour Dall-E en te basant sur la phrase : " + prompt;

        if(styleSelect.value != "none") {
            request += "Ajoutes un style " + styleSelect.value + ". ";
        } else {
            request += "Ajoutes un style comme photo, realististe, cartoon, 3D, croquis, manga, digital art, pixel art.";
        }

        if(backgroundSelect.value != "none") {
            request += "Ajoutes un arrière-plan " + backgroundSelect.value + ". ";
        } else {
            request += "Ajoutes un arrière-plan comme flou, floral, multicolor, couleur unique.";
        }
        
        request += "Retourne moi uniquement le prompt."

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${api_key}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: request
                }],
                max_tokens: 100
            })
        };
        try {
            const response = await fetch(endpointURL, options);
            const data = await response.json();
            const chatGptReponseTxt = data.choices[0].message.content;
            prompt = chatGptReponseTxt;
            console.log("Prompt pour Dall-E : " + chatGptReponseTxt);
        } catch (error) {
            console.log(error);
            throw error;
        }
        
        console.log("image de dall-E");
        let images = await getImageFromDallE(prompt);
        console.log(images);

        const gridContainer = document.createElement('div');

        if(document.querySelector('input[name="gridSize"]:checked').value === "2x2") {
            gridContainer.classList.add('grid-container');
        }

        images.data.forEach(imageObj => {
            const imageContainer = document.createElement('div');
            imageContainer.width=250;
            imageContainer.height=250;
            imageContainer.classList.add('image-container');

            const imgElement = document.createElement('img');
            imgElement.src = imageObj.url;
            imgElement.width=250;
            imgElement.height=250;

            imageContainer.append(imgElement);

            gridContainer.append(imageContainer);
        });
        outputElement.append(gridContainer);
        
        const pageHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        loader.classList.add('hide');
        window.scrollTo({ top: pageHeight, behavior: 'smooth'});
    } else {
        console.log("message de gpt-3.5");
        getResponseFromGPT(prompt);
    }
    
    clearInput();
}

/* GPT-3.5 */
async function getResponseFromGPT(prompt) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${api_key}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: prompt
            }],
            max_tokens: 100
        })
    };
    try {
        const response = await fetch(endpointURL, options);
        const data = await response.json();
        console.log(data);
        const chatGptReponseTxt = data.choices[0].message.content;
        const pElementChat = document.createElement('p');
        pElementChat.classList.add('reponse');
        pElementChat.textContent = chatGptReponseTxt;
        outputElement.append(pElementChat);

        const pageHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        loader.classList.add('hide');
        window.scrollTo({ top: pageHeight, behavior: 'smooth'});

        if (data.choices[0].message.content) {
            const pElement = document.createElement('p');
            pElement.textContent = inputElement.value;
            pElement.onclick = () => {
                inputElement.value = pElement.textContent;
            };
            historyElement.append(pElement);
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/* Dall-E */
async function getImageFromDallE(prompt) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${api_key}`
        },
        body: JSON.stringify({
            prompt: prompt,
            n:4,
            size: "256x256"
        })
    }

    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}