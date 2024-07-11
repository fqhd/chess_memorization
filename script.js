const pieceImages = {};
let selectedPiece = '.';
let board = null;
let previousBoard = null;
let wins = 0;
let losses = 0;
let numPiecesInput = null;
let fenStrings = [
    'k7/8/8/8/8/8/8/K7 w - - 0 1',
    '1k6/8/8/8/8/8/8/K7 w - - 0 1',
    '1k6/8/8/8/8/8/8/1K6 b - - 0 1',
    '2k5/8/8/8/8/8/8/1K6 w - - 0 1',
    '2k5/8/8/8/8/8/8/2K5 b - - 0 1'
];
let index = 0;
let w = null;
let l = null;

function preload() {
    pieceImages['r'] = loadImage('assets/br.png');
    pieceImages['n'] = loadImage('assets/bn.png');
    pieceImages['b'] = loadImage('assets/bb.png');
    pieceImages['q'] = loadImage('assets/bq.png');
    pieceImages['k'] = loadImage('assets/bk.png');
    pieceImages['p'] = loadImage('assets/bp.png');

    pieceImages['R'] = loadImage('assets/wr.png');
    pieceImages['N'] = loadImage('assets/wn.png');
    pieceImages['B'] = loadImage('assets/wb.png');
    pieceImages['Q'] = loadImage('assets/wq.png');
    pieceImages['K'] = loadImage('assets/wk.png');
    pieceImages['P'] = loadImage('assets/wp.png');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index between 0 and i
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function replaceAt(str, index, replacement) {
    return str.substring(0, index) + replacement + str.substring(index + 1);
}

async function loadGames(path) {
    const games = await fetch(path);
    fenStrings = await games.json();
    fenStrings = shuffleArray(fenStrings);
}

function createPieceButton(piece) {
    const image = pieceImages[piece];
    const button = createButton('');
    button.size(64, 64);
    image.loadPixels();
    let dataURL = image.canvas.toDataURL();
    button.style('background-image', `url(${dataURL})`);
    button.style('background-size', 'cover');
    button.mousePressed(() => {
        selectedPiece = piece;
    })
}

function setup () {
    board = fenToBoard('rnbqkb1r/pppp2pp/5p2/4N3/4n3/2P5/PP1P1PPP/RNBQKB1R w KQkq - 0 1');
    createP('Try to memorize the chess position that is on the board, after 10 seconds, the board will be whiped and you will have to reproduce the previous chess position from memory. When you are done, click "Check". This will check whether you perfectly copied the position and update your score.');
    numPiecesInput = createInput('3');
    createElement('br');
    createCanvas(512, 512);
    background(0);
    createPieceButton('p');
    createPieceButton('n');
    createPieceButton('b');
    createPieceButton('r');
    createPieceButton('q');
    createPieceButton('k');
    createElement('br');
    createPieceButton('P');
    createPieceButton('N');
    createPieceButton('B');
    createPieceButton('R');
    createPieceButton('Q');
    createPieceButton('K');
    createElement('br');
    createButton("Check").size(100, 100).mousePressed(check);
    createButton("Eraser").size(100, 100).mousePressed(() => {selectedPiece = '.'});
    createButton("Reload").size(100, 100).mousePressed(restart);
    w = createP('Wins: 0');
    l = createP('Losses: 0');
    loadGames('games/games_with_3_pieces.json').then(() => {
        loadChessPosition();
    })
}

function restart() {
    wins = 0;
    losses = 0;
    updateWinLoss();
    loadGames('games/games_with_' + numPiecesInput.value() + '_pieces.json').then(() => {
        loadChessPosition();
    });
}

function updateWinLoss() {
    w.html('Wins: ' + wins);
    l.html('Losses: ' + losses);
}

function loadChessPosition() {
    board = fenToBoard(fenStrings[index]);
    previousBoard = copyBoard();
    index++;
    setTimeout(() => {
        board = [
            '........',
            '........',
            '........',
            '........',
            '........',
            '........',
            '........',
            '........'
        ];
    }, 10000);
}

function copyBoard() {
    let newBoard = [];
    for(const line of board) {
        newBoard.push(line);
    }
    return newBoard;
}

function mousePressed() {
    if(mouseX < 512 && mouseX > 0 && mouseY < 512 && mouseY > 0) {
        const i = parseInt(mouseY / 64);
        const j = parseInt(mouseX / 64);

        board[i] = replaceAt(board[i], j, selectedPiece);
    }
}

function check() {
    let isValid = true;
    for(let i = 0; i < 8; i++) {
        if(board[i] != previousBoard[i]) {
            isValid = false;
        }
    }
    if(isValid) {
        correct();
    }else{
        incorrect();
    }
    updateWinLoss();
    loadChessPosition();
}

function correct() {
    console.log('correct');
    wins += 1;
}

function incorrect() {
    console.log('wrong');
    losses += 1;
}

function fenToBoard(fen) {
    const [position] = fen.split(' ');
    const rows = position.split('/');
    const board = rows.map(row => {
        return row.replace(/[1-8]/g, match => '.'.repeat(parseInt(match)));
    });
    return board;
}

function drawPiece(piece, i, j) {
    if((i + j) % 2 == 0) {
        fill('#ebd2b7');
    } else {
        fill('#a16f5a');
    }
    rect(j*64, i*64, 64, 64);
    if(piece != '.') {
        image(pieceImages[piece], j*64, i*64, 64, 64);
    }
}

function drawBoard(board) {
    for(let i = 0; i < 8; i++) {
        for(let j = 0; j < 8; j++) {
            const piece = board[i][j];
            drawPiece(piece, i, j);
        }
    }
}

function draw() {
    noStroke();
    drawBoard(board);
}