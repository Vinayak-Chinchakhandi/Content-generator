let topicHistory = JSON.parse(localStorage.getItem('topicHistory')) || {};

document.getElementById('generate').addEventListener('click', () => {
    const contentType = document.getElementById('contentType').value;
    const tone = document.getElementById('tone').value;
    const size = document.getElementById('size').value;
    const topic = document.getElementById('topic').value;
    const description = document.getElementById('description').value;

    const prompt = `You are a content writer. Write a ${size} ${contentType} about "${topic}" with a ${tone} tone. Description: ${description}`;

    document.getElementById('result').textContent = 'Generating...';
    document.getElementById('loading').style.display = 'block';

    fetch('http://127.0.0.1:5000/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loading').style.display = 'none';

        if (data.result) {
            document.getElementById('result').textContent = data.result;
            document.getElementById('save').style.display = 'block';
            document.getElementById('save').dataset.content = data.result;
            document.getElementById('copy').style.display = 'block';
            document.getElementById('copy').dataset.content = data.result;

            if (!topicHistory[topic]) {
                topicHistory[topic] = [];
            }
            topicHistory[topic].push({ prompt: prompt, response: data.result });
            localStorage.setItem('topicHistory', JSON.stringify(topicHistory)); // Save to local storage
        } else if (data.error) {
            document.getElementById('result').textContent = `Error: ${data.error}`;
            document.getElementById('save').style.display = 'none';
            document.getElementById('copy').style.display = 'none';
        }
        displayTopics();
    })
    .catch(error => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('result').textContent = `Network Error: ${error}`;
        document.getElementById('save').style.display = 'none';
        document.getElementById('copy').style.display = 'none';
    });
});

document.getElementById('save').addEventListener('click', () => {
    const content = document.getElementById('save').dataset.content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById('copy').addEventListener('click', () => {
    const content = document.getElementById('copy').dataset.content;
    navigator.clipboard.writeText(content).then(() => {
        alert('Text copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text.');
    });
});

document.getElementById('historyButton').addEventListener('click', () => {
    const historyDiv = document.getElementById('history');
    if (historyDiv.style.display === 'none') {
        historyDiv.style.display = 'block';
        displayTopics();
    } else {
        historyDiv.style.display = 'none';
    }
});

function displayTopics() {
    const topicList = document.getElementById('topicList');
    topicList.innerHTML = '';
    Object.keys(topicHistory).forEach(topic => {
        const topicItem = document.createElement('div');
        topicItem.classList.add('topic-item');
        topicItem.textContent = topic;
        topicItem.addEventListener('click', () => displayTopicInteractionsInMain(topic));
        topicList.appendChild(topicItem);
    });
}

function displayInteractions(topic) {
    const interactionList = document.getElementById('interactionList');
    interactionList.innerHTML = '';
    topicHistory[topic].forEach(interaction => {
        const interactionItem = document.createElement('div');
        interactionItem.classList.add('interaction-item');
        interactionItem.innerHTML = `<p class="prompt">Prompt: ${interaction.prompt}</p><p>Response: ${interaction.response}</p>`;
        interactionItem.addEventListener('click', () => {
            document.getElementById('result').textContent = interaction.response;
        });
        interactionList.appendChild(interactionItem);
    });
}

function displayTopicInteractionsInMain(topic) {
    const mainResult = document.getElementById('result');
    mainResult.innerHTML = '';

    if (topicHistory[topic]) {
        topicHistory[topic].forEach(interaction => {
            const interactionDiv = document.createElement('div');
            interactionDiv.innerHTML = `<p class="prompt">Prompt: ${interaction.prompt}</p><p>Response: ${interaction.response}</p><hr>`;
            mainResult.appendChild(interactionDiv);
        });
    } else {
        mainResult.textContent = 'No interactions found for this topic.';
    }
}

document.getElementById('clear').addEventListener('click', () => {
    document.getElementById('result').textContent = '';
});