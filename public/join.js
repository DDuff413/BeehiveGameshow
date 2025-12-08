const socket = io();

document.getElementById('joinBtn').addEventListener('click', joinGame);

document.getElementById('playerName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinGame();
    }
});

async function joinGame() {
    const nameInput = document.getElementById('playerName');
    const name = nameInput.value.trim();
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = '';
    
    if (!name) {
        errorMessage.textContent = 'Please enter your name';
        return;
    }
    
    try {
        const response = await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorMessage.textContent = data.error || 'Failed to join game';
            return;
        }
        
        // Show success message
        document.getElementById('joinForm').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('joinedName').textContent = name;
        
    } catch (error) {
        console.error('Error joining game:', error);
        errorMessage.textContent = 'Failed to join game. Please try again.';
    }
}
