const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const Row = 20;
const Col = Column =10;
const Sq = squaresize =20;
const Vacant = "WHITE"; // color of empty square

// draw a square

function drawSquare(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*Sq,y*Sq,Sq,Sq);

    ctx.strokeStyle ="BLACK";
    ctx.strokeRect(x*Sq,y*Sq,Sq,Sq);
}

// drawSquare(0,0,"RED")

// create the board
let board =[];
for(r=0;r<Row;r++){
    board[r]=[];
    for(c=0;c<Col;c++){
        board[r][c]=Vacant;
    }
}

//draw the board
function drawBoard(){
    for(r=0;r<Row;r++){
        for(c=0;c<Column;c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}

drawBoard();

//the pieces and their colors

const pieces = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];

//generate random pieces

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * pieces.length)// 0 -> 6
    return new Piece(pieces[r][0],pieces[r][1]);
}

let p = randomPiece();

//the object peice

function Piece(tetromino,color){
    this.tetromino=tetromino;
    this.color=color;

    this.tetrominoN=0;//we start from first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // we need to control the pieces
    this.x =3;
    this.y= -2;
}

//fill function
Piece.prototype.fill =function(color){
    for(r=0;r<this.activeTetromino.length;r++){
        for(c=0;c<this.activeTetromino.length;c++){
            
            //we draw only occupied square
            if(this.activeTetromino[r][c]){
                drawSquare(this.x+c,this.y+r,color);
            }
        }
    }
}

//draw a piece to the board
Piece.prototype.draw =function(){
    this.fill(this.color);
}
// p.draw();

//undraw a piece
Piece.prototype.undraw =function(){
    this.fill(Vacant);
}


//move Down the piece

Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)){
        this.undraw();
        this.y++;
        this.draw();        

    }else{
        //we lock the piece and generate new piece
        this.lock();
        p= randomPiece();
    }
    
}

//move the piece right
Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.undraw();
        this.x++;
        this.draw();

    }
    
}

//move the piece left
Piece.prototype.moveleft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.undraw();
        this.x--;
        this.draw();

    }
}

//rotate the piece 
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN+1)%this.tetromino.length];
    let kick=0;
    if(this.collision(0,0,nextPattern)){
        if(this.x>Col/2){
            //it is the right wall
            kick=-1;//move the piece to the left
        }else{
            //it is left wall
            kick=1;//move the piece to the right
        }
    }
    if(!this.collision(kick,0,nextPattern)){
        this.undraw();
        this.x +=kick;
        this.tetrominoN = (this.tetrominoN+1)%this.tetromino.length; // (0+1)%4=1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();

    }
    
}
//lock function
let score =0;
Piece.prototype.lock = function(){
    for(r=0;r<this.activeTetromino.length;r++){
        for(c=0;c<this.activeTetromino.length;c++){
            
            //we skip the vacant sqaure
            if(!this.activeTetromino[r][c]){
                continue;
            }
            //piece to lock on top = game over
            if(this.y+r<0){
                alert("Game Over");
                //stop request animatopn frame
                gameOver = true;
                break;

            }
            //we lock the piece
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full row
    for(r=0;r<Row;r++){
        let isRowFull = true;
        for(c=0;c<Col;c++){
            isRowFull = isRowFull &&(board[r][c] !=Vacant);
        }
        if(isRowFull){
            //if the row if full
            //we move all the row above it down
            for(y=r;y>1;y--){
                for(c=0;c<Col;c++){
                    board[y][c] = board[y-1][c];
                }
                
            }
            // the top row board[0][...] has no row above it
            for(c=0;c<Col;c++){
                board[0][c] = Vacant;
            }
            //increment the score by 10
            score+=10;

        }
        

    }
    //update the board
    drawBoard();

    //update the score
    scoreElement.innerHTML = score;
}

//collision function

Piece.prototype.collision = function(x,y,piece){
    for(r=0;r<piece.length;r++){
        for(c=0;c<piece.length;c++){
            // check if the square is empty, we skip it
            if(!piece[r][c]){
                continue;
            }
            //coord of the piece after movement
            let newX = this.x +c +x;
            let newY = this.y+r +y;

            //conditions
            if(newX<0 || newX >=Col ||newY>=Row){
                return true;
            }

            //skip newY<0;board[-1] will crash our game
            if(newY <0){
                continue;
            }
            //check is there is a locked piece already on board
            if(board[newY][newX]!=Vacant){
                return true;
            }

            
           
            }
        }
        return false;
    }

//control the piece
document.addEventListener("keydown",control);

function control(e){
    if(e.keyCode==37){
        p.moveleft();
        // dropStart = Date.now();
    }else if(e.keyCode==38){
        p.rotate();
        // dropStart = Date.now();
    }else if(e.keyCode==39){
        p.moveRight();
        // dropStart = Date.now();
    }else if(e.keyCode==40){
        p.moveDown();
    }
}

//drop the piece every 1 sec
let dropStart = Date.now();
let gameOver = false
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta>1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if(!gameOver){
        requestAnimationFrame(drop);
    }
    

}

drop();