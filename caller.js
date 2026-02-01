/**
 * VNEXT Bingo Caller
 * Logic for drawing numbers, speech, and board management
 */

class BingoCaller {
    constructor() {
        // Constants
        this.TOTAL_NUMBERS = 75;
        this.LETTERS = ['B', 'I', 'N', 'G', 'O'];

        // DOM Elements
        this.masterBoard = document.getElementById('masterBoard');
        this.currentBall = document.getElementById('currentBall');
        this.currentToLetter = document.getElementById('currentToLetter');
        this.currentToNumber = document.getElementById('currentToNumber');
        this.drawBtn = document.getElementById('drawBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.autoToggleBtn = document.getElementById('autoToggleBtn');
        this.speedRange = document.getElementById('speedRange');
        this.speedVal = document.getElementById('speedVal');
        this.recentCallsContainer = document.getElementById('recentCalls');
        this.callCountEl = document.getElementById('callCount');
        this.toggleSoundBtn = document.getElementById('toggleSoundBtn');
        this.toggleThemeBtn = document.getElementById('toggleThemeBtn');

        // Rules Modal
        this.rulesBtn = document.getElementById('rulesBtn');
        this.rulesModal = document.getElementById('rulesModal');
        this.closeRulesBtns = [
            document.getElementById('closeRulesBtn'),
            document.getElementById('closeRulesBtnBottom')
        ];

        // Audio
        this.soundDraw = document.getElementById('soundDraw');
        this.soundWin = document.getElementById('soundWin'); // Optional use
        this.isMuted = false;

        // State
        this.calledNumbers = new Set();
        this.history = [];
        this.isRolling = false;
        this.autoInterval = null;
        this.autoSpeed = 3000;

        this.init();
    }

    init() {
        this.renderMasterBoard();
        this.setupEventListeners();
        // Initialize speed
        this.updateSpeedDisplay();
    }

    setupEventListeners() {
        this.drawBtn.addEventListener('click', () => {
            if (this.isRolling) return;
            this.drawNumber();
        });

        this.resetBtn.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn chơi mới?')) {
                this.resetGame();
            }
        });

        this.autoToggleBtn.addEventListener('click', () => this.toggleAutoDraw());

        this.speedRange.addEventListener('input', (e) => {
            this.autoSpeed = e.target.value * 1000;
            this.updateSpeedDisplay();
            if (this.autoInterval) {
                // Restart with new speed
                this.stopAutoDraw();
                this.startAutoDraw();
            }
        });

        this.toggleSoundBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            this.toggleSoundBtn.classList.toggle('off', this.isMuted);
            this.toggleSoundBtn.querySelector('.btn-icon').textContent = this.isMuted ? '🔇' : '🔊';
        });

        this.toggleThemeBtn.addEventListener('click', () => {
            const body = document.body;
            if (body.classList.contains('theme-tet')) {
                body.classList.remove('theme-tet');
                localStorage.setItem('bingoTheme', 'default');
            } else {
                body.classList.add('theme-tet');
                localStorage.setItem('bingoTheme', 'theme-tet');
            }
        });

        // Restore theme
        if (localStorage.getItem('bingoTheme') === 'theme-tet') {
            document.body.classList.add('theme-tet');
        }

        // Global key listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.drawBtn.click();
            }
            if (e.code === 'Escape') {
                this.closeModal();
            }
        });

        // Rules Modal logic
        this.rulesBtn.addEventListener('click', () => this.openModal());
        this.closeRulesBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', () => this.closeModal());
        });

        // Close on overlay click
        this.rulesModal.addEventListener('click', (e) => {
            if (e.target === this.rulesModal) this.closeModal();
        });
    }

    openModal() {
        this.rulesModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }

    closeModal() {
        this.rulesModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    renderMasterBoard() {
        // Clear existing cells
        this.LETTERS.forEach(letter => {
            const rowEl = document.getElementById(`row-${letter}`);
            rowEl.innerHTML = '';
        });

        // Fill 1-75
        for (let i = 1; i <= this.TOTAL_NUMBERS; i++) {
            const letterIndex = Math.floor((i - 1) / 15);
            const letter = this.LETTERS[letterIndex];
            const rowEl = document.getElementById(`row-${letter}`);

            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.id = `cell-${i}`;
            cell.textContent = i;
            cell.dataset.number = i;
            rowEl.appendChild(cell);
        }
    }

    updateSpeedDisplay() {
        this.speedVal.textContent = `${this.speedRange.value}s`;
    }

    getLetterForNumber(num) {
        if (num <= 15) return 'B';
        if (num <= 30) return 'I';
        if (num <= 45) return 'N';
        if (num <= 60) return 'G';
        return 'O';
    }

    getClassForLetter(letter) {
        return `ball-${letter}`; // e.g., ball-B
    }

    getClassForNumber(num) {
        return this.getClassForLetter(this.getLetterForNumber(num)).replace('ball-', '').toLowerCase() + '-col';
    }

    drawNumber() {
        if (this.calledNumbers.size >= this.TOTAL_NUMBERS) {
            alert("Đã gọi hết số!");
            this.stopAutoDraw();
            return;
        }

        this.isRolling = true;
        this.drawBtn.disabled = true;

        // Add rolling class
        this.currentBall.classList.remove('popup');
        this.currentBall.classList.add('rolling');
        this.currentBall.className = 'bingo-ball rolling'; // Reset color classes
        this.currentToLetter.textContent = '?';
        this.currentToNumber.textContent = '--';

        // Play sound effect
        if (!this.isMuted) {
            this.soundDraw.currentTime = 0;
            this.soundDraw.play().catch(e => console.log('Audio play error', e));
        }

        // Simulate rolling time (shorter for auto mode usually, but visual needs time)
        const rollTime = 500;

        setTimeout(() => {
            // Pick random valid number
            let num;
            do {
                num = Math.floor(Math.random() * this.TOTAL_NUMBERS) + 1;
            } while (this.calledNumbers.has(num));

            this.finalizeDraw(num);
        }, rollTime);
    }

    finalizeDraw(num) {
        this.calledNumbers.add(num);
        this.history.unshift(num); // Add to beginning

        const letter = this.getLetterForNumber(num);

        // Update UI Ball
        this.currentBall.classList.remove('rolling');

        // Remove old color classes
        this.LETTERS.forEach(l => this.currentBall.classList.remove(`ball-${l}`));
        this.currentBall.classList.remove('inactive');

        // Add new color and popup
        this.currentBall.classList.add(`ball-${letter}`);
        this.currentBall.classList.add('popup');

        this.currentToLetter.textContent = letter;
        this.currentToNumber.textContent = num;

        // Update Board
        const cell = document.getElementById(`cell-${num}`);
        if (cell) {
            cell.classList.add('active');
            cell.classList.add('just-called');
            // Remove animation after a while
            setTimeout(() => cell.classList.remove('just-called'), 3000);
        }

        // Update History
        this.updateHistoryUI();
        this.callCountEl.textContent = `${this.calledNumbers.size}/${this.TOTAL_NUMBERS}`;

        // Announce
        this.speakNumber(num, letter);

        this.isRolling = false;
        this.drawBtn.disabled = false;

        // Check auto win? (No, this is caller machine)
    }

    updateHistoryUI() {
        this.recentCallsContainer.innerHTML = '';
        // Show last 5
        this.history.slice(1, 6).forEach(num => {
            const letter = this.getLetterForNumber(num);
            const ball = document.createElement('div');
            ball.className = `mini-ball ${letter.toLowerCase()}-col`; // e.g. b-col
            ball.textContent = num;
            this.recentCallsContainer.appendChild(ball);
        });
    }

    speakNumber(num, letter) {
        if (this.isMuted || !window.speechSynthesis) return;

        // Cancel previous interrupts
        window.speechSynthesis.cancel();

        // Default English Bingo Call (e.g. "B 12")
        const text = `${letter} ${num}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';

        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.lang.includes('en') || v.lang.startsWith('en'));

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    }

    toggleAutoDraw() {
        if (this.autoInterval) {
            this.stopAutoDraw();
        } else {
            this.startAutoDraw();
        }
    }

    startAutoDraw() {
        if (this.calledNumbers.size >= this.TOTAL_NUMBERS) return;

        this.autoToggleBtn.classList.add('btn-primary');
        this.autoToggleBtn.classList.remove('btn-secondary');
        this.autoToggleBtn.innerHTML = '<span class="btn-icon">⏸️</span> Dừng lại';

        // Draw immediately if not rolling
        if (!this.isRolling) this.drawNumber();

        this.autoInterval = setInterval(() => {
            if (!this.isRolling && this.calledNumbers.size < this.TOTAL_NUMBERS) {
                this.drawNumber();
            } else if (this.calledNumbers.size >= this.TOTAL_NUMBERS) {
                this.stopAutoDraw();
            }
        }, this.autoSpeed);
    }

    stopAutoDraw() {
        clearInterval(this.autoInterval);
        this.autoInterval = null;
        this.autoToggleBtn.classList.add('btn-secondary');
        this.autoToggleBtn.classList.remove('btn-primary');
        this.autoToggleBtn.innerHTML = '<span class="btn-icon">⚡</span> Tự động';
    }

    resetGame() {
        this.stopAutoDraw();
        this.calledNumbers.clear();
        this.history = [];
        this.currentBall.classList.add('inactive');
        this.currentBall.classList.remove('popup');
        this.LETTERS.forEach(l => this.currentBall.classList.remove(`ball-${l}`));
        this.currentToLetter.textContent = '?';
        this.currentToNumber.textContent = '--';
        this.callCountEl.textContent = '0/75';
        this.recentCallsContainer.innerHTML = '';

        // Reset board cells
        const cells = document.querySelectorAll('.board-cell');
        cells.forEach(c => {
            c.classList.remove('active');
            c.classList.remove('just-called');
        });

        this.drawBtn.disabled = false;
    }
}

// Initial voices load
window.speechSynthesis.onvoiceschanged = () => {
    // Refresh voices if needed, or just let speak() handle it
};

document.addEventListener('DOMContentLoaded', () => {
    window.bingoCaller = new BingoCaller();
});
