import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  Container, 
  Grid,
  GridItem,
  Button,
  useColorModeValue,
  Flex,
  HStack,
  Avatar,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Divider,
  useToast
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../contexts/GameContext';
import { useToken } from '../contexts/TokenContext';

// Draughts game board size
const BOARD_SIZE = 8;

const GamesPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { createWager, settleWager, isProcessingWager, minWager, maxWager } = useGame();
  const { sByteBalance, refreshBalances } = useToken();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const darkSquareColor = useColorModeValue('gray.300', 'gray.600');
  const lightSquareColor = useColorModeValue('white', 'gray.800');
  const selectedSquareColor = 'brand.100';
  
  // Game state
  const [board, setBoard] = useState<Array<Array<number>>>([]); // 0: empty, 1: player 1, 2: player 2
  const [selectedPiece, setSelectedPiece] = useState<{row: number, col: number} | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 or 2
  const [gameStarted, setGameStarted] = useState(false);
  const [wagerAmount, setWagerAmount] = useState(minWager.toString());
  const [wagerId, setWagerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<{player1: string, player2: string | null}>({
    player1: publicKey?.toString() || 'Player 1',
    player2: null
  });
  
  // Initialize board
  useEffect(() => {
    initializeBoard();
  }, []);
  
  // Update wager amount when min/max changes
  useEffect(() => {
    setWagerAmount(minWager.toString());
  }, [minWager]);
  
  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
    
    // Set up player 1 pieces (bottom)
    for (let row = 5; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = 1;
        }
      }
    }
    
    // Set up player 2 pieces (top)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = 2;
        }
      }
    }
    
    setBoard(newBoard);
  };
  
  const handleSquareClick = (row: number, col: number) => {
    if (!gameStarted) return;
    
    // If it's not the current player's turn, do nothing
    if ((currentPlayer === 1 && publicKey?.toString() !== players.player1) ||
        (currentPlayer === 2 && publicKey?.toString() !== players.player2)) {
      toast({
        title: "Not your turn",
        description: "Please wait for your opponent to make a move.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // If a piece is already selected
    if (selectedPiece) {
      // If clicking on the same piece, deselect it
      if (selectedPiece.row === row && selectedPiece.col === col) {
        setSelectedPiece(null);
        return;
      }
      
      // Check if the move is valid
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        // Make the move
        const newBoard = [...board];
        newBoard[row][col] = currentPlayer;
        newBoard[selectedPiece.row][selectedPiece.col] = 0;
        
        // Check if this was a capture move
        if (Math.abs(row - selectedPiece.row) === 2) {
          const captureRow = (row + selectedPiece.row) / 2;
          const captureCol = (col + selectedPiece.col) / 2;
          newBoard[captureRow][captureCol] = 0;
        }
        
        setBoard(newBoard);
        setSelectedPiece(null);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        
        // Check if game is over
        if (checkGameOver(newBoard)) {
          endGame(currentPlayer);
        }
      } else {
        toast({
          title: "Invalid move",
          description: "That move is not allowed.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      // If no piece is selected yet, select a piece if it belongs to the current player
      if (board[row][col] === currentPlayer) {
        setSelectedPiece({ row, col });
      } else if (board[row][col] !== 0) {
        toast({
          title: "Wrong piece",
          description: "You can only move your own pieces.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };
  
  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    // Check if destination is empty
    if (board[toRow][toCol] !== 0) return false;
    
    // Check if it's a diagonal move
    if (Math.abs(fromCol - toCol) !== Math.abs(fromRow - toRow)) return false;
    
    // Simple move (1 square diagonally)
    if (Math.abs(fromRow - toRow) === 1) {
      // Player 1 can only move up, Player 2 can only move down
      return (currentPlayer === 1 && toRow < fromRow) || (currentPlayer === 2 && toRow > fromRow);
    }
    
    // Capture move (2 squares diagonally)
    if (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2) {
      const captureRow = (fromRow + toRow) / 2;
      const captureCol = (fromCol + toCol) / 2;
      const capturedPiece = board[captureRow][captureCol];
      
      // Check if there's an opponent's piece to capture
      return capturedPiece !== 0 && capturedPiece !== currentPlayer;
    }
    
    return false;
  };
  
  const checkGameOver = (board: Array<Array<number>>) => {
    // Check if any player has no pieces left
    let player1Pieces = 0;
    let player2Pieces = 0;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === 1) player1Pieces++;
        if (board[row][col] === 2) player2Pieces++;
      }
    }
    
    return player1Pieces === 0 || player2Pieces === 0;
  };
  
  const endGame = async (winner: number) => {
    setGameStarted(false);
    
    if (wagerId) {
      // Determine winner's address
      const winnerAddress = winner === 1 ? players.player1 : players.player2;
      
      if (winnerAddress) {
        // Settle the wager
        await settleWager(wagerId, winnerAddress);
        
        // Refresh balances
        refreshBalances();
      }
    }
    
    toast({
      title: `Game Over!`,
      description: `Player ${winner} wins and receives ${parseFloat(wagerAmount) * 2 * 0.97} S-BYTE (after 3% fee)!`,
      status: "success",
      duration: 10000,
      isClosable: true,
    });
  };
  
  const startGame = async () => {
    // Check if user has enough balance
    if (sByteBalance === null || sByteBalance < parseFloat(wagerAmount)) {
      toast({
        title: "Insufficient balance",
        description: `You need at least ${wagerAmount} S-BYTE to place this wager.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Create wager
    const newWagerId = await createWager(parseFloat(wagerAmount));
    
    if (newWagerId) {
      setWagerId(newWagerId);
      
      // In a real implementation, this would match with another player
      // For now, we'll simulate a second player joining
      setPlayers({
        player1: publicKey?.toString() || 'Player 1',
        player2: 'Opponent'
      });
      
      setGameStarted(true);
      initializeBoard();
      setCurrentPlayer(1);
      onClose();
      
      toast({
        title: "Game started!",
        description: `You've wagered ${wagerAmount} S-BYTE. Good luck!`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const renderBoard = () => {
    return (
      <Grid templateColumns={`repeat(${BOARD_SIZE}, 1fr)`} width="100%" maxW="500px" mx="auto">
        {board.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            const isLightSquare = (rowIndex + colIndex) % 2 === 0;
            const isPieceSelected = selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex;
            
            return (
              <GridItem 
                key={`${rowIndex}-${colIndex}`}
                w="100%" 
                paddingBottom="100%" 
                position="relative"
                bg={isPieceSelected ? selectedSquareColor : isLightSquare ? lightSquareColor : darkSquareColor}
                border="1px solid"
                borderColor={borderColor}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                cursor={gameStarted ? "pointer" : "default"}
              >
                {cell !== 0 && (
                  <Box 
                    position="absolute" 
                    top="10%" 
                    left="10%" 
                    width="80%" 
                    height="80%" 
                    borderRadius="50%" 
                    bg={cell === 1 ? "red.500" : "blue.500"}
                  />
                )}
              </GridItem>
            );
          })
        )}
      </Grid>
    );
  };
  
  if (!connected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box p={8} borderRadius="lg" bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
          <Heading size="md" mb={4}>Connect Your Wallet</Heading>
          <Text>Please connect your Solana wallet to play games and wager S-BYTE tokens.</Text>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>Games</Heading>
      
      <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={8}>
        <Heading as="h2" size="lg" mb={4} textAlign="center">Draughts (Checkers)</Heading>
        
        {gameStarted ? (
          <VStack spacing={6}>
            <HStack spacing={8} width="100%" justifyContent="center" mb={4}>
              <VStack>
                <Avatar bg="red.500" size="md" />
                <Text fontWeight="bold">Player 1</Text>
                <Badge colorScheme={currentPlayer === 1 ? "green" : "gray"}>
                  {currentPlayer === 1 ? "Current Turn" : "Waiting"}
                </Badge>
              </VStack>
              
              <VStack>
                <Heading size="md">VS</Heading>
                <Text>{parseFloat(wagerAmount) * 2} S-BYTE pot</Text>
                <Text fontSize="sm">(3% fee applies to winner)</Text>
              </VStack>
              
              <VStack>
                <Avatar bg="blue.500" size="md" />
                <Text fontWeight="bold">Player 2</Text>
                <Badge colorScheme={currentPlayer === 2 ? "green" : "gray"}>
                  {currentPlayer === 2 ? "Current Turn" : "Waiting"}
                </Badge>
              </VStack>
            </HStack>
            
            {renderBoard()}
            
            <Button 
              colorScheme="red" 
              onClick={() => {
                setGameStarted(false);
                setWagerId(null);
                toast({
                  title: "Game forfeited",
                  description: "You have forfeited the game and lost your wager.",
                  status: "warning",
                  duration: 5000,
                  isClosable: true,
                });
              }}
            >
              Forfeit Game
            </Button>
          </VStack>
        ) : (
          <VStack spacing={6}>
            <Text fontSize="lg" textAlign="center">
              Challenge other players to a game of draughts and wager your S-BYTE tokens!
            </Text>
            
            <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200" width="100%">
              <Text fontWeight="bold" mb={2}>How it works:</Text>
              <VStack align="start" spacing={2}>
                <Text>1. Choose how much S-BYTE you want to wager</Text>
                <Text>2. Get matched with another player wagering the same amount</Text>
                <Text>3. Play draughts - winner takes the pot (minus 3% fee)</Text>
                <Text>4. Fees help fund the ByteCoin blockchain development</Text>
              </VStack>
            </Box>
            
            <Button 
              colorScheme="brand" 
              size="lg" 
              onClick={onOpen}
              isDisabled={sByteBalance === null || sByteBalance < minWager}
            >
              Start a Game
            </Button>
            
            {sByteBalance !== null && sByteBalance < minWager && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Text>You need at least {minWager} S-BYTE to play. Current balance: {sByteBalance} S-BYTE</Text>
              </Alert>
            )}
            
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text>More games coming soon to the ByteCoin ecosystem!</Text>
            </Alert>
          </VStack>
        )}
      </Box>
      
      {/* Wager Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Wager S-BYTE to Play</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Choose how much S-BYTE you want to wager. The winner will receive both wagers, minus a 3% fee.
              </Text>
              
              <FormControl>
                <FormLabel>Wager Amount (S-BYTE)</FormLabel>
                <Input 
                  type="number" 
                  value={wagerAmount} 
                  onChange={(e) => setWagerAmount(e.target.value)}
                  min={minWager}
                  max={maxWager}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Min: {minWager} S-BYTE, Max: {maxWager} S-BYTE
                </Text>
              </FormControl>
              
              <Box p={4} borderRadius="md" bg="gray.50" width="100%">
                <Text fontWeight="bold" mb={2}>Summary:</Text>
                <HStack justify="space-between">
                  <Text>Your wager:</Text>
                  <Text>{wagerAmount} S-BYTE</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Opponent wager:</Text>
                  <Text>{wagerAmount} S-BYTE</Text>
                </HStack>
                <Divider my={2} />
                <HStack justify="space-between">
                  <Text>Total pot:</Text>
                  <Text>{parseFloat(wagerAmount) * 2} S-BYTE</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Winner receives:</Text>
                  <Text>{parseFloat(wagerAmount) * 2 * 0.97} S-BYTE</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Fee (3%):</Text>
                  <Text>{parseFloat(wagerAmount) * 2 * 0.03} S-BYTE</Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={startGame}
              isLoading={isProcessingWager}
              loadingText="Creating Wager..."
            >
              Start Game
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default GamesPage;
