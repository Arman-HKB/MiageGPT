// Requests to davinci costs 10% of the price of GPT-3.5 per token !!!!
const endpointURL = 'https://api.openai.com/v1/chat/completions';

let home, keyAlert, keyInput, api_key, max_tokens, loader, outputElement, actionsSelect, submitButton, inputElement, historyElement, butonElement, styleSelect, backgroundSelect, promptSave;
let isSpeechRecognitionActive = false; // Variable pour indiquer si la reconnaissance vocale est active
let recognition; // Variable pour stocker l'instance de la reconnaissance vocale

window.onload = init;

function init() {
    home = document.querySelector('#homeContainer');
    keyAlert = document.querySelector('#key-alert');

    keyInput = document.querySelector('#key');
    max_tokens = document.querySelector('#max_tokens');
    loader = document.querySelector('#loader');
    
    actionsSelect = document.querySelector('#actionsSelect');

    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#new_submit');
    submitButton.onclick = beforeGetMessage;

    inputElement = document.querySelector('#new_prompt');
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

    keyInput.addEventListener("keyup", function(event) {
        if(keyInput.value != "") {
            keyAlert.classList.add('hide');
        } else {
            keyAlert.classList.remove('hide');
        }
    });

    const microphoneButton = document.getElementById('microphoneButton');
    microphoneButton.addEventListener('click', toggleSpeechRecognition);

    function toggleSpeechRecognition() {
        if (!isSpeechRecognitionActive) {
            inputElement.focus();
            startSpeechRecognition();
        } else {
            stopSpeechRecognition();
        }
    }

    function startSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Créer une instance de la reconnaissance vocale
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();

      recognition.lang = 'fr-FR'; // Définir le code de langue en français

      // Événement lorsque la reconnaissance vocale reçoit un résultat
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Texte reconnu : ", transcript);
        
        // Écrire automatiquement le texte reconnu à l'endroit pour envoyer le message
        inputElement.value = transcript;

        // Envoyer le message
        beforeGetMessage();
      };

      // Démarrer la reconnaissance vocale
      recognition.start();

      // Mettre à jour l'état de la reconnaissance vocale
      isSpeechRecognitionActive = true;
      
      // Mettre à jour l'apparence du bouton du microphone
      microphoneButton.classList.add('active');
    } else {
      console.log("La reconnaissance vocale n'est pas prise en charge par votre navigateur.");
    }
  }

  function stopSpeechRecognition() {
    // Arrêter la reconnaissance vocale
    recognition.stop();

    // Mettre à jour l'état de la reconnaissance vocale
    isSpeechRecognitionActive = false;
    
    // Mettre à jour l'apparence du bouton du microphone
    microphoneButton.classList.remove('active');
  }

  const themeSwitch = document.querySelector('#theme-toggle');
  themeSwitch.addEventListener('change', toggleTheme);
  
  function toggleTheme() {
    const body = document.querySelector('body');
    body.classList.toggle('light-theme');
  }
}

function clearInput() {
    submitButton.classList.remove('green');
    inputElement.value = '';
}

function beforeGetMessage() {
    api_key = keyInput.value;
    if(api_key != "") {
        home.classList.add('hide');

        outputElement.innerHTML += '<div class="user px-0 py-5"><div class="row w-50"><div class="col-1"><img src="./img/user.svg" alt="user" class="user-img"></div><div class="col-11">'+inputElement.value+'</div></div></div>';

        loader.classList.remove('hide');
        getMessage();
    }
}

async function getMessage() {

    let prompt = inputElement.value;
    prompt = prompt.toLowerCase();

    let option = actionsSelect.value;
    console.log(option);
    
    //if (prompt.startsWith('/image ')) {
    if (option === "/image") {
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
                max_tokens: parseInt(max_tokens.value)
            })
        };
        try {
            const response = await fetch(endpointURL, options);
            const data = await response.json();
            const chatGptReponseTxt = data.choices[0].message.content;
            prompt = chatGptReponseTxt;
            promptSave = chatGptReponseTxt;
            outputElement.innerHTML += '<div class="gpt px-0 py-5"><div class="row w-50"><div class="col-1"><img src="./img/gpt.svg" alt="user" class="user-img"></div><div class="col-11">Prompt pour Dall-E : '+chatGptReponseTxt+'</div></div></div>';
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

        let index = 0;
        
        let gptDivs = document.getElementsByClassName('gpt');
        let lastGptDiv = gptDivs[gptDivs.length - 1];
        let col11Div = lastGptDiv.querySelector('.col-11');

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

            imgElement.addEventListener('click', () => {
                // Fonction pas encore disponible
                //getAlternativeImageFromDallE(promptSave, imgElement.src);
            });

            gridContainer.append(imageContainer);
            
            index++;
        });
        //outputElement.append(gridContainer);
        col11Div.append(gridContainer);
        
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
        getResponseFromGPT(prompt, option);
    }
    
    clearInput();
}

/* GPT-3.5 */
async function getResponseFromGPT(prompt, option) {
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
            max_tokens: parseInt(max_tokens.value)
        })
    };

    try {
        const response = await fetch(endpointURL, options);
        const data = await response.json();
        console.log(data);
        const chatGptReponseTxt = data.choices[0].message.content;
        let formattedResponse = chatGptReponseTxt;

        if (isCodeResponse(chatGptReponseTxt)) {
            const codeBlock = chatGptReponseTxt.match(/```([\s\S]+?)```/);
            if (codeBlock) {
                const code = codeBlock[1];
                const formattedCode = '<pre><code class="hljs">' + code + '</code></pre>';
                formattedResponse = chatGptReponseTxt.replace(codeBlock[0], formattedCode);
            }
        }
    
        outputElement.innerHTML += '<div class="gpt px-0 py-5"><div class="row w-50"><div class="col-1"><img src="./img/gpt.svg" alt="user" class="user-img"></div><div class="col-11">' + formattedResponse + '</div></div></div>';
        hljs.highlightAll();

        const pageHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );

        loader.classList.add('hide');
        window.scrollTo({ top: pageHeight, behavior: 'smooth' });

        if (data.choices[0].message.content) {
            const pElement = document.createElement('p');
            pElement.textContent = inputElement.value;
            pElement.onclick = () => {
                inputElement.value = pElement.textContent;
            };
            historyElement.append(pElement);
        }

        if (option === "/speech") {
            const utterance = new SpeechSynthesisUtterance(chatGptReponseTxt);
            speechSynthesis.speak(utterance);
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

// Crée un model pour DALL-E
async function fineTuneDALL_E(imageUrl, prompt) {
    const options = {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${api_key}`,
        },
        body: JSON.stringify({
            images: [imageUrl],
            prompts: [prompt],
        }),
    };
  
    try {
        const response = await fetch(
            'https://api.openai.com/v1/engines/davinci/codex/fine-tune',
            options
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Génère une image alternative à partir d'un prompt et d'un model DALL-E
async function generateAlternativeImageFromDallE(prompt, modelId) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${api_key}`,
        },
        body: JSON.stringify({
            prompt: prompt,
            n: 4,
            size: '256x256',
            model: modelId,
        }),
    };
  
    try {
        const response = await fetch(
            'https://api.openai.com/v1/images/generations',
            options
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getAlternativeImageFromDallE(prompt, reference) {
    try {
        let fineTuningResult = await createFineTuneForDallE(reference, prompt);
        let similarImages = await generateAlternativeImageFromDallE(prompt, fineTuningResult.id);
        console.log(similarImages);
    } catch (error) {
        console.log(error);
    }
}