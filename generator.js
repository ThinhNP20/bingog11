/**
 * VNEXT G11 Bingo Card Generator
 * Premium Bingo Card Generator with G11 Branding
 */

class BingoGenerator {
    constructor() {
        // DOM Elements
        this.form = document.getElementById('bingoForm');
        this.cardTitleInput = document.getElementById('cardTitle');
        this.cardSubtitleInput = document.getElementById('cardSubtitle');
        this.appThemeInput = document.getElementById('appTheme');
        this.cardCountInput = document.getElementById('cardCount');
        this.maxNumberInput = document.getElementById('maxNumber');

        // Title Customization
        this.titleColorInput = document.getElementById('titleColor');
        this.titleStyleInput = document.getElementById('titleStyle');

        // Subtitle Customization
        this.subtitleColorInput = document.getElementById('subtitleColor');
        this.subtitleStyleInput = document.getElementById('subtitleStyle');

        this.freeSpaceCountInput = document.getElementById('freeSpaceCount');
        this.gridColsInput = document.getElementById('gridCols');
        this.gridRowsInput = document.getElementById('gridRows');
        this.printLayoutInput = document.getElementById('printLayout');
        this.winConditionInput = document.getElementById('winCondition');
        this.generateBtn = document.getElementById('generateBtn');
        this.printBtn = document.getElementById('printBtn');
        this.decreaseBtn = document.getElementById('decreaseBtn');
        this.increaseBtn = document.getElementById('increaseBtn');
        this.cardsContainer = document.getElementById('cardsContainer');
        this.cardCounter = document.getElementById('cardCounter');
        this.printArea = document.getElementById('printArea');

        // State
        this.cards = [];
        this.winCondition = 'standard';
        this.gridCols = 5;
        this.gridRows = 5;
        this.printLayout = 4;

        // Initialize
        this.init();

        // Apply default theme or saved theme if any
        this.applyTheme(this.appThemeInput.value);
    }

    init() {
        // Event Listeners
        this.form.addEventListener('submit', (e) => this.handleGenerate(e));
        this.printBtn.addEventListener('click', () => this.handlePrint());
        this.decreaseBtn.addEventListener('click', () => this.adjustCount(-1));
        this.increaseBtn.addEventListener('click', () => this.adjustCount(1));

        // Theme Change
        this.appThemeInput.addEventListener('change', (e) => this.applyTheme(e.target.value));
    }

    applyTheme(themeName) {
        document.body.className = ''; // Reset
        document.body.classList.add(themeName);

        // Optional: Auto-set colors for Tet theme if user hasn't customized yet
        if (themeName === 'theme-tet') {
            document.documentElement.style.setProperty('--primary', '#D00000'); // Lucky Red
            document.documentElement.style.setProperty('--secondary', '#FFD700'); // Gold
            document.documentElement.style.setProperty('--accent', '#FFA500'); // Orange
            document.documentElement.style.setProperty('--gradient', 'linear-gradient(135deg, #D00000 0%, #FFD700 100%)');
        } else {
            // Reset to default G11 variables if needed, OR just rely on CSS classes overrides
            // For simplicity, we'll let CSS handle most visual changes, but JS can help with dynamic vars
            document.documentElement.style.removeProperty('--primary');
            document.documentElement.style.removeProperty('--secondary');
            document.documentElement.style.removeProperty('--accent');
            document.documentElement.style.removeProperty('--gradient');
        }
    }

    /**
     * Adjust card count
     */
    adjustCount(delta) {
        const current = parseInt(this.cardCountInput.value) || 1;
        const max = parseInt(this.cardCountInput.getAttribute('max')) || 1000;
        const newValue = Math.max(1, Math.min(max, current + delta));
        this.cardCountInput.value = newValue;
    }

    /**
     * Generate random numbers for a Bingo card
     * Traditional Bingo: B(1-15), I(16-30), N(31-45), G(46-60), O(61-75)
     * But we'll adjust based on maxNumber setting
     */
    /**
     * Generate random numbers for a Bingo card
     * Adapts to rows and cols
     */
    generateCardNumbers(maxNumber, cols, rows) {
        const columns = [];
        // Determine range per column based on maxNumber and columns count
        const rangeSize = Math.floor(maxNumber / cols);

        for (let col = 0; col < cols; col++) {
            const min = col * rangeSize + 1;
            const max = col === cols - 1 ? maxNumber : (col + 1) * rangeSize;

            const columnNumbers = [];
            const available = [];

            // Create array of available numbers for this column
            for (let i = min; i <= max; i++) {
                available.push(i);
            }

            // Shuffle and pick 'rows' numbers
            this.shuffleArray(available);
            for (let i = 0; i < rows; i++) {
                // If not enough numbers available (rare but possible with bad settings), handling gracefully
                if (i < available.length) {
                    columnNumbers.push(available[i]);
                } else {
                    columnNumbers.push(0); // Should be prevented by validation
                }
            }

            columns.push(columnNumbers);
        }

        return columns;
    }

    /**
     * Fisher-Yates shuffle algorithm
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Create a single Bingo card element
     */
    /**
     * Create a single Bingo card element
     */
    createCardElement(cardData, cardIndex) {
        const card = document.createElement('div');
        card.className = 'bingo-card';
        card.style.animationDelay = `${cardIndex * 0.1}s`;

        // Determine Free Space positions (Random)
        const cols = cardData.cols;
        const rows = cardData.rows;
        const totalCells = cols * rows;
        const freeSpacesDesired = cardData.freeSpaces || 1;
        const freeSpaceIndices = new Set();

        // Generate unique random indices
        while (freeSpaceIndices.size < freeSpacesDesired && freeSpaceIndices.size < totalCells) {
            const index = Math.floor(Math.random() * totalCells);
            freeSpaceIndices.add(index);
        }

        // Build grid header (letters) if 5x5, else generic or numbered
        let letters = ['B', 'I', 'N', 'G', 'O'];
        if (cols !== 5) {
            // Generate generic letters or numbers based on column count
            letters = Array.from({ length: cols }, (_, i) => i + 1);
        }

        let headerHTML = `<div class="bingo-letters" style="grid-template-columns: repeat(${cols}, 1fr)">`;
        letters.forEach(l => {
            headerHTML += `<div class="bingo-letter">${l}</div>`;
        });
        headerHTML += '</div>';

        // Build grid content
        let gridCellsHTML = '';

        // Add number rows - Iterating row by row
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Check if this is a random free space
                const currentIndex = row * cols + col;

                if (freeSpaceIndices.has(currentIndex)) {
                    gridCellsHTML += `
                        <div class="number-cell free-space marked" data-row="${row}" data-col="${col}" data-free="true" onclick="this.classList.toggle('marked'); window.bingoApp.checkWin(this)">
                            <div class="free-space-icon">⚡</div>
                            <span class="free-space-g11">VNEXT</span>
                            <span class="free-space-g11">SPIRIT</span>
                        </div>
                    `;
                } else {
                    gridCellsHTML += `
                        <div class="number-cell" data-row="${row}" data-col="${col}" onclick="this.classList.toggle('marked'); window.bingoApp.checkWin(this)">${cardData.columns[col][row]}</div>
                    `;
                }
            }
        }

        card.innerHTML = `
            <div class="card-header">
                <div class="card-title ${cardData.titleStyle || ''}" style="color: ${cardData.titleColor || ''}">${cardData.title}</div>
                ${cardData.subtitle ? `<div class="card-subtitle ${cardData.subtitleStyle || ''}" style="color: ${cardData.subtitleColor || ''}">${cardData.subtitle}</div>` : ''}
            </div>
            <div class="card-grid" style="grid-template-columns: repeat(${cols}, 1fr)">
                ${headerHTML}
                ${gridCellsHTML}
            </div>
            <div class="card-number">Thẻ #${cardIndex + 1}</div>
        `;

        return card;
    }

    /**
     * Check for win condition
     */
    checkWin(cellElement) {
        const cardGrid = cellElement.closest('.card-grid');
        if (!cardGrid) return;

        // Derive grid dimensions from the card object in memory is better, 
        // but here we can check CSS or attributes.
        // Let's rely on 'this.gridRows' and 'this.gridCols' as currently 
        // we only generate one batch at a time with same settings.
        const rows = this.gridRows;
        const cols = this.gridCols;

        const cells = Array.from(cardGrid.querySelectorAll('.number-cell'));

        // Map cells to 2D array of marked status
        const grid = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const index = r * cols + c;
                const cell = cells[index];
                if (cell) {
                    row.push(cell.classList.contains('marked'));
                } else {
                    row.push(false);
                }
            }
            grid.push(row);
        }

        let isWin = false;

        if (this.winCondition === 'fullhouse') {
            // Check if ALL cells are marked
            isWin = grid.every(row => row.every(marked => marked));
        } else {
            // Standard: Row, Column, Diagonal

            // Rows
            for (let r = 0; r < rows; r++) {
                if (grid[r].every(m => m)) isWin = true;
            }

            // Columns
            for (let c = 0; c < cols; c++) {
                if (grid.map(row => row[c]).every(m => m)) isWin = true;
            }

            // Diagonals (Only if square or rectangular? Usually diagonals only apply to squares)
            // But let's support "TopLeft to BottomRight" logic generally if desired,
            // or strictly if it is a "Line". 
            // For rectangular bingo, traditionally diagonals might not play or only corner-to-corner relative?
            // User asked for "Check all cells" mainly. 
            // I'll keep diagonals strictly for Main Diagonal and Anti-Diagonal if min(rows,cols) > 1?
            // Actually, simplest implies diagonals usually only on squares.
            // But let's check N cells where r==c or r == rows-1-c ?
            if (rows === cols) {
                if (grid.map((row, i) => row[i]).every(m => m)) isWin = true;
                if (grid.map((row, i) => row[rows - 1 - i]).every(m => m)) isWin = true;
            }
        }

        if (isWin) {
            this.celebrateWin(cellElement.closest('.bingo-card'));
        }
    }

    celebrateWin(cardElement) {
        // Prevent spamming
        if (cardElement.classList.contains('winner')) return;

        cardElement.classList.add('winner');
        alert('🎉 BINGO! Chúc mừng bạn đã trúng thưởng! 🎉\n(VNEXT G11 SPIRIT)');

        // Optional: Add simple confetti effect or style change
        cardElement.style.boxShadow = '0 0 50px #ff6b00';
    }

    /**
     * Handle form submission
     */
    handleGenerate(e) {
        e.preventDefault();

        const title = this.cardTitleInput.value.trim() || 'VNEXT G11 BINGO';
        const subtitle = this.cardSubtitleInput.value.trim();
        const count = parseInt(this.cardCountInput.value) || 1;
        const maxNumber = parseInt(this.maxNumberInput.value) || 75;
        this.gridCols = parseInt(this.gridColsInput.value) || 5;
        this.gridRows = parseInt(this.gridRowsInput.value) || 5;
        this.winCondition = this.winConditionInput.value;
        const freeSpaces = parseInt(this.freeSpaceCountInput.value) || 0;

        // Style values
        const titleColor = this.titleColorInput.value;
        const titleStyle = this.titleStyleInput.value;
        const subtitleColor = this.subtitleColorInput.value;
        const subtitleStyle = this.subtitleStyleInput.value;

        // Validate
        if (count < 1 || count > 1000) {
            alert('Số lượng thẻ phải từ 1 đến 1000');
            return;
        }

        // Validate grid size vs max number (approx)
        const minMaxNumber = this.gridCols * this.gridRows;
        // Actually per column needs range: maxNumber / cols >= rows ideally?
        // or at least total numbers >= total cells.
        const rangePerCol = Math.floor(maxNumber / this.gridCols);

        if (rangePerCol < this.gridRows) {
            alert(`Với ${this.gridCols} cột và ${this.gridRows} dòng, mỗi cột cần khoảng ${this.gridRows} số.\nVui lòng tăng "Số lớn nhất" lên ít nhất ${this.gridCols * this.gridRows}.`);
            return; // Strict validation to prevent empty cells
        }

        // Apply print layout setting
        document.documentElement.style.setProperty('--print-cols', this.printLayout == 1 ? '1' : '2');
        // Simple logic: 4 => 2 columns, 2 => 2 columns but bigger? Or 1 column 2 rows?
        // Let's rely on CSS media print logic.
        // We'll set a class on the container or body to handle print styles
        document.body.setAttribute('data-print-layout', this.printLayout);


        // Generate cards
        this.cards = [];
        for (let i = 0; i < count; i++) {
            this.cards.push({
                title: title,
                subtitle: subtitle,
                rows: this.gridRows,
                cols: this.gridCols,
                freeSpaces: freeSpaces,
                titleColor: titleColor,
                titleStyle: titleStyle,
                subtitleColor: subtitleColor,
                subtitleStyle: subtitleStyle,
                columns: this.generateCardNumbers(maxNumber, this.gridCols, this.gridRows)
            });
        }

        // Render cards with animation
        this.renderCards();

        // Enable print button
        this.printBtn.disabled = false;

        // Update counter
        this.cardCounter.textContent = `${count} thẻ`;
    }

    /**
     * Render all cards to the container
     */
    renderCards() {
        this.cardsContainer.innerHTML = '';

        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.cardsContainer.appendChild(cardElement);
        });
    }

    /**
     * Handle print - now prints visible cards directly
     */
    handlePrint() {
        // Trigger print
        window.print();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.bingoApp = new BingoGenerator();
});
