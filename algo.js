var cells;
var visitedCell;
var pathToAnimation;
var dropOptions = null;
var wallToAnimation;
let matrix;
let row, col;
let pixelSize = 40;
let start_Coordinate;
let end_Coordinate;
let algorithm = 'Depth-First-Search-Recursive';
const board = document.getElementById('board');
const runBtn = document.getElementById('visualize');
const removePath = document.getElementById('clearPath');
const clearMaze = document.getElementById('clearBoard');
const navOptions = document.querySelectorAll('.nav-menu>li>a');
const generateMazeBtn = document.getElementById('generateMazeBtn');

GenBoard();

removePath.addEventListener('click', clearPath);
clearMaze.addEventListener('click', clearBoard);

generateMazeBtn.addEventListener('click', () => {
    wallToAnimation = [];
    clearBoard();
    generateMaze(0, row - 1, 0, col - 1, false, 'horizontal');
    Animation(wallToAnimation, 'wall');
})

runBtn.addEventListener('click', () => {
    clearPath();
    visitedCell = [];
    pathToAnimation = [];
    switch (algorithm) {
        case 'Breadth-First-Search':
            BFS();
            break;
        case 'Dijkstra':
            Dijsktra();
            break;
        case 'Depth-First-Search-Recursive':
            DFS_Recursive();
            break;
        case 'Depth-First-Search-Iterative':
            DFS_Iterative();
            break;
        default:
            break;
    }
    Animation(visitedCell, 'visited');
})

function Animation(elements, className) {
    let delay = 10;
    if (className === 'path')
        delay *= 3.5;

    for (let i = 0; i < elements.length; i++) {
        setTimeout(() => {
            elements[i].classList.remove('visited');
            elements[i].classList.add(className);
            if (i === elements.length - 1 && className === 'visited') {
                Animation(pathToAnimation, 'path');
            }
        }, delay * i);
    }
}

function getPath(parent, target) {
    if (!target) return;
    pathToAnimation.push(matrix[target.x][target.y]);
    
    const p = parent.get(`${target.x}-${target.y}`);
    getPath(parent, p);
}

//Breadth-First-Search Algorithm 
function BFS() {
    const queue = [];
    const visited = new Set();
    const parent = new Map();

    queue.push(start_Coordinate);
    visited.add(`${start_Coordinate.x}-${start_Coordinate.y}`);

    while (queue.length > 0) {
        const current = queue.shift();
        visitedCell.push(matrix[current.x][current.y]);

        if (current.x === end_Coordinate.x && current.y === end_Coordinate.y) {
            getPath(parent, end_Coordinate);
            return;
        }

        const neighbours = [
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];

        for (const neighbour of neighbours) {
            const key = `${neighbour.x}-${neighbour.y}`;

            if (IsInBound(neighbour.x, neighbour.y) &&
                !visited.has(key) &&
                !matrix[neighbour.x][neighbour.y].classList.contains('wall')
            ) {
                queue.push(neighbour);
                visited.add(key);
                parent.set(key, current);
            }
        }
    }
}


//Depth-First-Search Algorithm Recusive 
function DFS_Recursive(current = start_Coordinate, visited = new Set(), parent = new Map()) {
    const key = `${current.x}-${current.y}`;
    visited.add(key);
    visitedCell.push(matrix[current.x][current.y]);

    if (current.x === end_Coordinate.x && current.y === end_Coordinate.y) {
        getPath(parent, end_Coordinate);
        return true;
    }

    const neighbours = [
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y }, 
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
    ];

    for (const neighbour of neighbours) {
        const neighbourKey = `${neighbour.x}-${neighbour.y}`;

        if (IsInBound(neighbour.x, neighbour.y) &&
            !visited.has(neighbourKey) &&
            !matrix[neighbour.x][neighbour.y].classList.contains('wall')
        ) {
            parent.set(neighbourKey, current);
            if (DFS_Recursive(neighbour, visited, parent)) {
                return true;
            }
        }
    }

    return false;
}

//Depth-First-Search Algorithm Iterative 
function DFS_Iterative() {
    const stack = [];
    const visited = new Set();
    const parent = new Map();

    stack.push(start_Coordinate);
    visited.add(`${start_Coordinate.x}-${start_Coordinate.y}`);

    while (stack.length > 0) {
        const current = stack.pop();
        visitedCell.push(matrix[current.x][current.y]);

        if (current.x === end_Coordinate.x && current.y === end_Coordinate.y) {
            getPath(parent, end_Coordinate);
            return;
        }

        const neighbours = [
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];

        for (const neighbour of neighbours) {
            const key = `${neighbour.x}-${neighbour.y}`;

            if (IsInBound(neighbour.x, neighbour.y) &&
                !visited.has(key) &&
                !matrix[neighbour.x][neighbour.y].classList.contains('wall')
            ) {
                stack.push(neighbour);
                visited.add(key);
                parent.set(key, current);
            }
        }
    }
}

// Dijsktra's Algorithm 
class PQ {
    constructor() {
        this.length = 0;
        this.elements = [];
    }
    pop() {
        this.swap(0, this.length - 1);
        const popped = this.elements.pop();
        this.length--;
        this.downheapify(0);
        return popped;
    }
    push(data) {
        this.elements.push(data);
        this.length++;
        this.upHeapify(this.length - 1);
    }

    upHeapify(i) {
        if (i === 0) return;
        const parent = Math.floor((i - 1) / 2);
        if (this.elements[i].cost < this.elements[parent].cost) {
            this.swap(parent, i);
            this.upHeapify(parent);
        }
    }
    downheapify(i) {
        let minNode = i;
        const leftChild = (2 * i) + 1;
        const rightChild = (2 * i) + 2;

        if (leftChild < this.length && this.elements[leftChild].cost < this.elements[minNode].cost) {
            minNode = leftChild;
        }
        if (rightChild < this.length && this.elements[rightChild].cost < this.elements[minNode].cost) {
            minNode = rightChild;
        }

        if (minNode !== i) {
            this.swap(minNode, i);
            this.downheapify(minNode);
        }
    }
    swap(x, y) {
        [this.elements[x], this.elements[y]] = [this.elements[y], this.elements[x]];
    }
    isEmpty() {
        return this.length === 0;
    }
}

function Dijsktra() {
    const pq = new PQ();
    const parent = new Map();
    const distance = [];

    for (let i = 0; i < row; i++) {
        const INF = [];
        for (let j = 0; j < col; j++) {
            INF.push(Infinity);
        }
        distance.push(INF);
    }

    distance[start_Coordinate.x][start_Coordinate.y] = 0;
    pq.push({ cordinate: start_Coordinate, cost: 0 });

    while (!pq.isEmpty()) {
        const { cordinate: current, cost: distanceSoFar } = pq.pop();
        visitedCell.push(matrix[current.x][current.y]);

        if (current.x === end_Coordinate.x && current.y === end_Coordinate.y) {
            getPath(parent, end_Coordinate);
            return;
        }

        const neighbours = [
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];

        for (const neighbour of neighbours) {
            const key = `${neighbour.x}-${neighbour.y}`;

            if (IsInBound(neighbour.x, neighbour.y) &&
                !matrix[neighbour.x][neighbour.y].classList.contains('wall')
            ) {
                const edgeWeight = 1;
                const distanceToNeighbour = distanceSoFar + edgeWeight;

                if (distanceToNeighbour < distance[neighbour.x][neighbour.y]) {
                    distance[neighbour.x][neighbour.y] = distanceToNeighbour;
                    pq.push({ cordinate: neighbour, cost: distanceToNeighbour });
                    parent.set(key, current);
                }
            }
        }
    }
}

function generateMaze(rowStart, rowEnd, colStart, colEnd, surroundingWall, orientation) {
    if (rowStart > rowEnd || colStart > colEnd) {
        return;
    }

    if (!surroundingWall) {
        for (let i = 0; i < col; i++) {
            if (!matrix[0][i].classList.contains('source') && !matrix[0][i].classList.contains('target'))
                wallToAnimation.push(matrix[0][i]);

            if (!matrix[row - 1][i].classList.contains('source') && !matrix[row - 1][i].classList.contains('target'))
                wallToAnimation.push(matrix[row - 1][i]);
        }

        for (let i = 0; i < row; i++) {
            if (!matrix[i][0].classList.contains('source') && !matrix[i][0].classList.contains('target'))
                wallToAnimation.push(matrix[i][0]);

            if (!matrix[i][col - 1].classList.contains('source') && !matrix[i][col - 1].classList.contains('target'))
                wallToAnimation.push(matrix[i][col - 1]);
        }

        surroundingWall = true;
    }

    if (orientation === 'horizontal') {
        let possibleRows = [];
        for (let i = rowStart; i <= rowEnd; i += 2) {
            possibleRows.push(i);
        }

        let possibleCols = [];
        for (let i = colStart - 1; i <= colEnd + 1; i += 2) {
            if (i > 0 && i < col - 1)
                possibleCols.push(i);
        }

        let currentRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];
        let randomCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];

        for (let i = colStart - 1; i <= colEnd + 1; i++) {
            const cell = matrix[currentRow][i];

            if (!cell || i === randomCol || cell.classList.contains('source') || cell.classList.contains('target'))
                continue;

            wallToAnimation.push(cell);
        }
        generateMaze(rowStart, currentRow - 2, colStart, colEnd, surroundingWall, (currentRow - 2 - rowStart > colEnd - colStart) ? 'horizontal' : 'vertical');

        generateMaze(currentRow + 2, rowEnd, colStart, colEnd, surroundingWall, (rowEnd - (currentRow + 2) > colEnd - colStart) ? 'horizontal' : 'vertical');
    }
    else {
        let possibleCols = [];
        for (let i = colStart; i <= colEnd; i += 2) {
            possibleCols.push(i);
        }

        let possibleRows = [];
        for (let i = rowStart - 1; i <= rowEnd + 1; i += 2) {
            if (i > 0 && i < row - 1)
                possibleRows.push(i);
        }

        let currentCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];
        let randomRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];


        for (let i = rowStart - 1; i <= rowEnd + 1; i++) {
            if (!matrix[i]) continue;
            const cell = matrix[i][currentCol];

            if (!cell || i === randomRow || cell.classList.contains('source') || cell.classList.contains('target'))
                continue;

            wallToAnimation.push(cell);
        }

        generateMaze(rowStart, rowEnd, colStart, currentCol - 2, surroundingWall, (rowEnd - rowStart > currentCol - 2 - colStart) ? 'horizontal' : 'vertical');

        generateMaze(rowStart, rowEnd, currentCol + 2, colEnd, surroundingWall, (rowEnd - rowStart > colEnd - (currentCol + 2)) ? 'horizontal' : 'vertical');
    }

}

function clearPath() {
    cells.forEach(cell => {
        cell.classList.remove('path');
        cell.classList.remove('visited');
    })
}

function clearBoard() {
    cells.forEach(cell => {
        cell.classList.remove('path');
        cell.classList.remove('visited');
        cell.classList.remove('wall');
    })
}

function boardInteraction(cells) {
    let isDrawing = false;
    let isDragging = false;
    let DragPoint = null;

    cells.forEach((cell) => {

        const pointerdown = (e) => {
            if (e.target.classList.contains('source')) {
                DragPoint = 'source';
                isDragging = true;
            }
            else if (e.target.classList.contains('target')) {
                DragPoint = 'target';
                isDragging = true;
            }
            else {
                isDrawing = true;
            }
        }

        const pointermove = (e) => {
            if (isDrawing && !e.target.classList.contains('source') && !e.target.classList.contains('target')) {
                e.target.classList.add('wall');
            }
            else if (DragPoint && isDragging) {
                cells.forEach(cell => {
                    cell.classList.remove(`${DragPoint}`);
                })

                e.target.classList.add(`${DragPoint}`)
                const cordinate = e.target.id.split('-');

                if (DragPoint === 'source') {
                    start_Coordinate.x = +cordinate[0];
                    start_Coordinate.y = +cordinate[1];
                }
                else {
                    end_Coordinate.x = +cordinate[0];
                    end_Coordinate.y = +cordinate[1];
                }
            }
        }
        const pointerup = () => {
            isDragging = false;
            isDrawing = false;
            DragPoint = null;
        }
        cell.addEventListener('pointerdown', pointerdown);
        cell.addEventListener('pointermove', pointermove);
        cell.addEventListener('pointerup', pointerup);
        cell.addEventListener('click', () => {
            cell.classList.toggle('wall');
        })
    });
}

function toggle_dropOption(target) {
    dropOptions.forEach(dropOption => {
        dropOption.addEventListener('click', () => {
            removeActive(dropOptions);
            dropOption.classList.add('active');
            algorithm = dropOption.innerText.split(' ')[0];
            runBtn.innerText = `Run ${algorithm}`
            removeActive(navOptions, true);
        })
    })
}

document.addEventListener('click', (e) => {
    const navMenu = document.querySelector('.nav-menu');

    if (!navMenu.contains(e.target)) {
        removeActive(navOptions, true);
    }
})

function IsInBound(x, y) {
    return (x >= 0 && y >= 0 && x < row && y < col)
}
function set(className, x = -1, y = -1) {
    if (IsInBound(x, y)) {
        matrix[x][y].classList.add(className);
    }
    else {
        x = Math.floor(Math.random() * row);
        y = Math.floor(Math.random() * col);
        matrix[x][y].classList.add(className);
    }

    return { x, y };
}

const removeActive = (elements, parent = false) => {
    elements.forEach(element => {
        if (parent) element = element.parentElement;
        element.classList.remove('active');
    });
}

navOptions.forEach(navOption => {
    navOption.addEventListener('click', () => {
        const li = navOption.parentElement;
        if (li.classList.contains('active')) {
            li.classList.remove('active');
            return;
        }
        removeActive(navOptions, true);
        li.classList.add('active');

        if (li.classList.contains('drop-box')) {
            dropOptions = li.querySelectorAll('.drop-menu>li');

            toggle_dropOption(navOption.innerText);
        }
    })
})


function GenBoard(cellWidth = 40) {
    const root = document.documentElement;
    root.style.setProperty('--cell-width', `${cellWidth}px`);
    col = Math.floor(board.clientWidth / cellWidth);
    row = Math.floor(board.clientHeight / cellWidth);
    cells = [];
    matrix = [];
    board.innerHTML = '';

    for (let i = 0; i < row; i++) {
        const rowArr = [];
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');
        rowElement.setAttribute('id', `${i}`);

        for (let j = 0; j < col; j++) {
            const colElement = document.createElement('div');
            colElement.classList.add('col');
            colElement.setAttribute('id', `${i}-${j}`);
            cells.push(colElement);
            rowArr.push(colElement);
            rowElement.appendChild(colElement);
        }

        matrix.push(rowArr);
        board.appendChild(rowElement);
    }

    start_Coordinate = set('source');
    end_Coordinate = set('target');
    boardInteraction(cells);
}