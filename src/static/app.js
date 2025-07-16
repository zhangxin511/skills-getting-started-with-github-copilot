// Kids Typing Practice App - Interactive JavaScript

class TypingGame {
    constructor() {
        this.currentWord = '';
        this.currentLevel = 'letters';
        this.isGameActive = false;
        this.stats = {
            words_completed: 0,
            letters_typed: 0,
            accuracy: 100,
            level: 'letters'
        };
        
        this.encouragementMessages = [
            "You're doing amazing! 🌟",
            "Keep going, superstar! ⭐",
            "Fantastic typing! 🎉",
            "You're getting better! 🚀",
            "Great job, keep it up! 👏",
            "You're a typing champion! 🏆",
            "Wonderful work! 🌈",
            "Keep practicing! 💪",
            "You're so good at this! 😊",
            "Amazing progress! 🎯"
        ];
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
    }
    
    initializeElements() {
        this.targetWordEl = document.getElementById('target-word');
        this.typingInput = document.getElementById('typing-input');
        this.feedbackEl = document.getElementById('feedback');
        this.startBtn = document.getElementById('start-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.changeLevelBtn = document.getElementById('change-level-btn');
        this.modal = document.getElementById('level-modal');
        this.closeModalBtn = document.getElementById('close-modal');
        this.encouragementEl = document.getElementById('encouragement-message');
        
        // Stats elements
        this.wordsCountEl = document.getElementById('words-count');
        this.accuracyEl = document.getElementById('accuracy');
        this.currentLevelEl = document.getElementById('current-level');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.nextBtn.addEventListener('click', () => this.nextWord());
        this.changeLevelBtn.addEventListener('click', () => this.showLevelModal());
        this.closeModalBtn.addEventListener('click', () => this.hideLevelModal());
        
        this.typingInput.addEventListener('input', (e) => this.handleTyping(e));
        this.typingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkWord();
            }
        });
        
        // Level selection buttons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeLevel(e.target.dataset.level);
            });
        });
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideLevelModal();
            }
        });
        
        // Add keyboard key click listeners
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', (e) => {
                if (this.isGameActive) {
                    const letter = e.target.dataset.key;
                    this.handleKeyboardClick(letter);
                }
            });
        });
    }
    
    handleKeyboardClick(letter) {
        // Add the letter to the input
        if (letter === ' ') {
            // Handle space key
            this.typingInput.value += ' ';
        } else {
            this.typingInput.value += letter;
        }
        
        // Trigger the input event to update the game state
        const inputEvent = new Event('input', { bubbles: true });
        this.typingInput.dispatchEvent(inputEvent);
        
        // Add a visual feedback for the clicked key
        const keyElement = document.querySelector(`[data-key="${letter}"]`);
        if (keyElement) {
            keyElement.style.transform = 'scale(0.95)';
            setTimeout(() => {
                keyElement.style.transform = '';
            }, 150);
        }
    }
    
    async startGame() {
        this.isGameActive = true;
        this.startBtn.style.display = 'none';
        this.nextBtn.style.display = 'inline-block';
        this.typingInput.disabled = false;
        this.typingInput.focus();
        
        await this.loadNewWord();
        this.showEncouragement("Let's start typing! 🚀");
    }
    
    async loadNewWord() {
        try {
            const response = await fetch('/word/random');
            const data = await response.json();
            this.currentWord = data.word;
            this.displayWord();
            this.clearInput();
        } catch (error) {
            console.error('Error loading word:', error);
            this.currentWord = 'cat'; // fallback word
            this.displayWord();
        }
    }
    
    displayWord() {
        this.targetWordEl.textContent = this.currentWord;
        this.targetWordEl.style.color = '#FF1493';
        
        // Highlight the first letter on the keyboard
        this.highlightKeyboardKey(this.currentWord.charAt(0).toLowerCase());
    }
    
    clearInput() {
        this.typingInput.value = '';
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'input-feedback';
        this.clearKeyboardHighlight();
    }
    
    handleTyping(e) {
        if (!this.isGameActive) return;
        
        const userInput = e.target.value.toLowerCase().trim();
        const targetWord = this.currentWord.toLowerCase();
        
        // Provide real-time feedback
        if (userInput === targetWord) {
            this.feedbackEl.textContent = '✅ Perfect!';
            this.feedbackEl.className = 'input-feedback feedback-correct';
        } else if (targetWord.startsWith(userInput)) {
            this.feedbackEl.textContent = '👍 Keep going!';
            this.feedbackEl.className = 'input-feedback';
            this.feedbackEl.style.color = '#32CD32';
        } else {
            this.feedbackEl.textContent = '🤔 Try again!';
            this.feedbackEl.className = 'input-feedback feedback-incorrect';
        }
        
        // Highlight letters as they type
        this.highlightLetters(userInput, targetWord);
    }
    
    highlightLetters(userInput, targetWord) {
        let highlightedWord = '';
        
        for (let i = 0; i < targetWord.length; i++) {
            const letter = targetWord[i];
            
            if (i < userInput.length) {
                if (userInput[i] === letter) {
                    highlightedWord += `<span class="letter-correct">${letter}</span>`;
                } else {
                    highlightedWord += `<span class="letter-incorrect">${letter}</span>`;
                }
            } else if (i === userInput.length) {
                highlightedWord += `<span class="letter-current">${letter}</span>`;
            } else {
                highlightedWord += letter;
            }
        }
        
        this.targetWordEl.innerHTML = highlightedWord;
        
        // Highlight the next letter to type on the keyboard
        const nextLetterIndex = userInput.length;
        if (nextLetterIndex < targetWord.length) {
            const nextLetter = targetWord.charAt(nextLetterIndex).toLowerCase();
            this.highlightKeyboardKey(nextLetter);
        } else {
            this.clearKeyboardHighlight();
        }
    }
    
    highlightKeyboardKey(letter) {
        // Clear previous highlights
        this.clearKeyboardHighlight();
        
        // Find and highlight the key
        const key = document.querySelector(`[data-key="${letter}"]`);
        if (key) {
            key.classList.add('highlight');
            
            // Show finger guidance message
            const finger = key.dataset.finger;
            const fingerMessages = {
                'left-pinky': 'Use your LEFT PINKY finger! 🤙',
                'left-ring': 'Use your LEFT RING finger! 💍',
                'left-middle': 'Use your LEFT MIDDLE finger! 🖕',
                'left-index': 'Use your LEFT INDEX finger! 👉',
                'thumbs': 'Use your THUMBS! 👍',
                'right-index': 'Use your RIGHT INDEX finger! 👉',
                'right-middle': 'Use your RIGHT MIDDLE finger! 🖕',
                'right-ring': 'Use your RIGHT RING finger! 💍',
                'right-pinky': 'Use your RIGHT PINKY finger! 🤙'
            };
            
            const message = fingerMessages[finger] || 'Find the letter!';
            this.showFingerGuidance(message);
        }
    }
    
    clearKeyboardHighlight() {
        document.querySelectorAll('.key.highlight').forEach(key => {
            key.classList.remove('highlight');
        });
    }
    
    showFingerGuidance(message) {
        // Update encouragement message with finger guidance
        const originalMessage = this.encouragementEl.textContent;
        this.encouragementEl.textContent = message;
        this.encouragementEl.style.animation = 'pulse 1s ease-in-out';
        
        // Reset animation after it completes
        setTimeout(() => {
            this.encouragementEl.style.animation = '';
        }, 1000);
    }
    
    async checkWord() {
        if (!this.isGameActive) return;
        
        const userInput = this.typingInput.value.toLowerCase().trim();
        const targetWord = this.currentWord.toLowerCase();
        const isCorrect = userInput === targetWord;
        
        // Update progress
        await this.updateProgress(isCorrect, targetWord.length);
        
        if (isCorrect) {
            this.feedbackEl.textContent = '🎉 Excellent! Well done!';
            this.feedbackEl.className = 'input-feedback feedback-correct';
            this.showEncouragement(this.getRandomEncouragement());
            this.celebrateSuccess();
        } else {
            this.feedbackEl.textContent = '💭 Try again! You can do it!';
            this.feedbackEl.className = 'input-feedback feedback-incorrect';
            this.showEncouragement("No worries! Keep trying! 💪");
        }
        
        // Auto-advance after a short delay for correct answers
        if (isCorrect) {
            setTimeout(() => {
                this.nextWord();
            }, 1500);
        }
    }
    
    celebrateSuccess() {
        // Add a fun animation to the target word
        this.targetWordEl.style.animation = 'bounce 0.6s ease-in-out';
        setTimeout(() => {
            this.targetWordEl.style.animation = '';
        }, 600);
        
        // Play a sound effect (if supported)
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAYBzuM0fPNdCYGKn/K8dqGMQYSasTu6KpZGAyPu+zlsGEcBzuS1/LKZCYGK3zI8d+DPAoTYbLr6KVMEAvPpt/vo2McETOa7PLEeSwGJnjG8N2QQAoTY7Xi5KJREAzSrODpvWQYCTuGz/TPfCwHJXzG8N6COwsUYbXm6qZQEQy9m93vqGEXDT1+w/DXfywGKHzE8N6COAoUY7vt6qVSEgyzm9rurGEYAXCU0/LNeSsFK3rJ8N6BPwsXZbfr5qFKEQz5u+Ps4GQHKHzE8N6COwsUY7vt6qVSEgynGNHp7qA=');
            audio.play();
        } catch (e) {
            // Sound not supported, continue silently
        }
    }
    
    async nextWord() {
        await this.loadNewWord();
        this.clearInput();
        this.typingInput.focus();
    }
    
    async updateProgress(correct, wordLength) {
        try {
            const response = await fetch('/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correct: correct,
                    word_length: wordLength
                })
            });
            
            if (response.ok) {
                this.stats = await response.json();
                this.updateStatsDisplay();
            }
        } catch (error) {
            console.error('Error updating progress:', error);
            // Update local stats as fallback
            this.stats.words_completed++;
            this.stats.letters_typed += wordLength;
            this.updateStatsDisplay();
        }
    }
    
    async loadStats() {
        try {
            const response = await fetch('/stats');
            if (response.ok) {
                this.stats = await response.json();
                this.currentLevel = this.stats.level;
                this.updateStatsDisplay();
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    updateStatsDisplay() {
        this.wordsCountEl.textContent = this.stats.words_completed;
        this.accuracyEl.textContent = Math.round(this.stats.accuracy) + '%';
        this.currentLevelEl.textContent = this.getLevelDisplayName(this.stats.level);
        
        // Update current level if it changed
        if (this.currentLevel !== this.stats.level) {
            this.currentLevel = this.stats.level;
            this.showEncouragement(`🎉 Level up! Now playing: ${this.getLevelDisplayName(this.stats.level)}!`);
        }
    }
    
    getLevelDisplayName(level) {
        const levelNames = {
            'letters': 'Letters 🔤',
            'easy': 'Easy Words 😊',
            'animals': 'Animals 🐾',
            'colors': 'Colors 🌈',
            'numbers': 'Numbers 🔢',
            'family': 'Family 👨‍👩‍👧‍👦'
        };
        return levelNames[level] || level;
    }
    
    showLevelModal() {
        this.modal.style.display = 'block';
    }
    
    hideLevelModal() {
        this.modal.style.display = 'none';
    }
    
    async changeLevel(newLevel) {
        this.currentLevel = newLevel;
        this.stats.level = newLevel;
        this.updateStatsDisplay();
        this.hideLevelModal();
        
        if (this.isGameActive) {
            await this.loadNewWord();
            this.clearInput();
            this.typingInput.focus();
        }
        
        this.showEncouragement(`🎨 Switched to ${this.getLevelDisplayName(newLevel)}! Have fun!`);
    }
    
    getRandomEncouragement() {
        return this.encouragementMessages[Math.floor(Math.random() * this.encouragementMessages.length)];
    }
    
    showEncouragement(message) {
        this.encouragementEl.textContent = message;
        this.encouragementEl.style.animation = 'bounce 0.5s ease-in-out';
        setTimeout(() => {
            this.encouragementEl.style.animation = '';
        }, 500);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TypingGame();
});

// Add some fun keyboard effects
document.addEventListener('keydown', (e) => {
    // Add a subtle effect when any key is pressed
    if (e.key.length === 1) { // Only for character keys
        document.body.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fad0c4 100%)';
        setTimeout(() => {
            document.body.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)';
        }, 100);
    }
});
