import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  FormControl,
  FormLabel,
  Input,
  useColorModeValue,
  Icon,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  Switch,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAdminAuth } from '../../../useWalletHooks';
import { ADMIN_ADDRESS, FEE_PERCENTAGE, useAdmin } from './AdminContext';
import { FaShieldAlt, FaCoins, FaUsers, FaCog, FaExternalLinkAlt, FaKey, FaLock, FaUnlock } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Motion components
const MotionBox = motion(Box);

// User interface
interface User {
  address: string;
  role: 'admin' | 'moderator' | 'user';
  joinDate: Date;
  transactions: number;
  balance: number;
  status: 'active' | 'suspended' | 'banned';
}

// Mock user data
const MOCK_USERS: User[] = [
  {
    address: ADMIN_ADDRESS,
    role: 'admin',
    joinDate: new Date(2025, 0, 15),
    transactions: 156,
    balance: 25000,
    status: 'active'
  },
  {
    address: '8xyt45JNHGe4TFXxvLAGYHXmdGFpzW9HxMJQA1wpFGx7',
    role: 'moderator',
    joinDate: new Date(2025, 1, 20),
    transactions: 87,
    balance: 12500,
    status: 'active'
  },
  {
    address: '3nWLGFmqcJfpWTWTYbHCviZCGZ7dj4xNUTrKGJPGqcQY',
    role: 'user',
    joinDate: new Date(2025, 2, 5),
    transactions: 42,
    balance: 5000,
    status: 'active'
  },
  {
    address: '5YTfrbtYP1UgMJSXanPAJSZZwGZSKKGkNGfRSUKaUUy1',
    role: 'user',
    joinDate: new Date(2025, 2, 10),
    transactions: 28,
    balance: 3200,
    status: 'suspended'
  },
  {
    address: '7XfrbtYP1UgMJSXanPAJSZZwGZSKKGkNGfRSUKaUUy1',
    role: 'user',
    joinDate: new Date(2025, 2, 15),
    transactions: 15,
    balance: 1800,
    status: 'active'
  }
];

// Settings interface
interface AppSettings {
  feePercentage: number;
  minTransferAmount: number;
  maxTransferAmount: number;
  maintenanceMode: boolean;
  allowNewUsers: boolean;
  allowSwaps: boolean;
  allowGames: boolean;
}

// Mock settings
const MOCK_SETTINGS: AppSettings = {
  feePercentage: FEE_PERCENTAGE,
  minTransferAmount: 0.1,
  maxTransferAmount: 10000,
  maintenanceMode: false,
  allowNewUsers: true,
  allowSwaps: true,
  allowGames: true
};

// Announcement interface
interface Announcement {
  id: string;
  title: string;
  content: string;
  date: Date;
  author: string;
  published: boolean;
}

// Mock announcements
const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to ByteCoin on Solana',
    content: 'We are excited to announce the launch of ByteCoin on Solana! This is the first step towards our goal of creating a fully decentralized ByteCoin blockchain.',
    date: new Date(2025, 3, 10),
    author: ADMIN_ADDRESS,
    published: true
  },
  {
    id: '2',
    title: 'New Features Coming Soon',
    content: 'We are working on adding new features to the ByteCoin on Solana app, including a governance system and staking rewards.',
    date: new Date(2025, 3, 12),
    author: ADMIN_ADDRESS,
    published: true
  },
  {
    id: '3',
    title: 'Maintenance Announcement',
    content: 'The app will be undergoing maintenance on April 20, 2025 from 2:00 UTC to 4:00 UTC. During this time, the app may be unavailable.',
    date: new Date(2025, 3, 15),
    author: ADMIN_ADDRESS,
    published: false
  }
];

const AdminPanel: React.FC = () => {
  const { connected } = useWallet();
  const { isAuthorized, loading: authLoading, authenticate, error: authError } = useAdminAuth();
  const { adminAddress, feePercentage, totalFeesCollected } = useAdmin();
  const toast = useToast();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<AppSettings>(MOCK_SETTINGS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Modal state for new announcement
  const { isOpen: isAnnouncementOpen, onOpen: onAnnouncementOpen, onClose: onAnnouncementClose } = useDisclosure();
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    published: false
  });
  
  // Colors
  const cardBg = useColorModeValue('white', '#1A1A22');
  const borderColor = useColorModeValue('gray.200', '#2A2A32');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('gray.50', '#2A2A32');
  
  // Load data
  useEffect(() => {
    if (isAuthorized) {
      setIsLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        setUsers(MOCK_USERS);
        setSettings(MOCK_SETTINGS);
        setAnnouncements(MOCK_ANNOUNCEMENTS);
        setIsLoading(false);
      }, 1000);
    }
  }, [isAuthorized]);
  
  // Handle authentication
  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    
    try {
      const success = await authenticate();
      
      if (success) {
        toast({
          title: 'Authentication successful',
          description: 'You now have admin access',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Authentication failed',
          description: authError || 'Failed to authenticate as admin',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Authentication error',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Handle settings update
  const handleSettingsUpdate = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Settings updated',
        description: 'App settings have been updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle user status update
  const handleUserStatusUpdate = (address: string, newStatus: 'active' | 'suspended' | 'banned') => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedUsers = users.map(user => 
        user.address === address ? { ...user, status: newStatus } : user
      );
      
      setUsers(updatedUsers);
      
      toast({
        title: 'User status updated',
        description: `User ${address.slice(0, 6)}... status changed to ${newStatus}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle new announcement
  const handleAnnouncementSubmit = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        title: 'Missing information',
        description: 'Please provide both title and content for the announcement',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newId = (announcements.length + 1).toString();
      
      const announcement: Announcement = {
        id: newId,
        title: newAnnouncement.title || '',
        content: newAnnouncement.content || '',
        date: new Date(),
        author: adminAddress,
        published: newAnnouncement.published || false
      };
      
      setAnnouncements([announcement, ...announcements]);
      
      toast({
        title: 'Announcement created',
        description: announcement.published ? 'Announcement has been published' : 'Announcement has been saved as draft',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setNewAnnouncement({
        title: '',
        content: '',
        published: false
      });
      
      onAnnouncementClose();
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle announcement publish toggle
  const handleAnnouncementPublish = (id: string, published: boolean) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedAnnouncements = announcements.map(announcement => 
        announcement.id === id ? { ...announcement, published } : announcement
      );
      
      setAnnouncements(updatedAnnouncements);
      
      toast({
        title: published ? 'Announcement published' : 'Announcement unpublished',
        description: `Announcement has been ${published ? 'published' : 'unpublished'}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };
  
  // Not connected state
  if (!connected) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={10}>
            <Heading size="lg" mb={4}>Connect Your Wallet</Heading>
            <Text color={mutedColor}>
              Please connect your wallet to access the admin panel
            </Text>
          </Box>
        </VStack>
      </Container>
    );
  }
  
  // Authentication required state
  if (!isAuthorized && !authLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <MotionBox
            p={8}
            borderRadius="xl"
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VStack spacing={6} align="center">
              <Icon as={FaShieldAlt} boxSize={16} color="brand.500" />
              
              <Heading size="lg">Admin Authentication Required</Heading>
              
              <Text textAlign="center" color={mutedColor} maxW="600px">
                This panel is restricted to the ByteCoin admin. Please authenticate with your wallet to access admin features.
              </Text>
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Admin Address</AlertTitle>
                  <AlertDescription>
                    <Text fontFamily="mono" fontSize="sm">
                      {ADMIN_ADDRESS}
                    </Text>
                  </AlertDescription>
                </Box>
              </Alert>
              
              <Button
                leftIcon={<Icon as={FaKey} />}
                colorScheme="brand"
                size="lg"
                onClick={handleAuthenticate}
                isLoading={isAuthenticating}
                loadingText="Authenticating"
              >
                Authenticate as Admin
              </Button>
              
              {authError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    );
  }
  
  // Loading state
  if (authLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="center" justify="center" height="300px">
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text>Verifying admin access...</Text>
        </VStack>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Admin Panel</Heading>
          <Badge colorScheme="red" p={2} borderRadius="md" fontSize="md">
            Admin Access
          </Badge>
        </Flex>
        
        {/* Admin Dashboard */}
        <MotionBox
          p={6}
          borderRadius="xl"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <VStack spacing={6} align="stretch">
            <Heading size="md">Admin Dashboard</Heading>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
              <GridItem>
                <Stat>
                  <StatLabel color={mutedColor}>Total Fees Collected</StatLabel>
                  <StatNumber fontSize="2xl">
                    {isLoading ? <Spinner size="sm" /> : totalFeesCollected.toFixed(2)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    23.36% (30 days)
                  </StatHelpText>
                </Stat>
              </GridItem>
              
              <GridItem>
                <Stat>
                  <StatLabel color={mutedColor}>Total Users</StatLabel>
                  <StatNumber fontSize="2xl">
                    {isLoading ? <Spinner size="sm" /> : users.length}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    12.75% (30 days)
                  </StatHelpText>
                </Stat>
              </GridItem>
              
              <GridItem>
                <Stat>
                  <StatLabel color={mutedColor}>Active Users</StatLabel>
                  <StatNumber fontSize="2xl">
                    {isLoading ? <Spinner size="sm" /> : users.filter(u => u.status === 'active').length}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    18.42% (vs prev week)
                  </StatHelpText>
                </Stat>
              </GridItem>
              
              <GridItem>
                <Stat>
                  <StatLabel color={mutedColor}>Total Transactions</StatLabel>
                  <StatNumber fontSize="2xl">
                    {isLoading ? <Spinner size="sm" /> : users.reduce((sum, user) => sum + user.transactions, 0)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    32.18% (vs prev month)
                  </StatHelpText>
                </Stat>
              </GridItem>
            </Grid>
          </VStack>
        </MotionBox>
        
        {/* Admin Tabs */}
        <Tabs variant="soft-rounded" colorScheme="brand" isLazy>
          <TabList>
            <Tab _selected={{ bg: 'brand.500', color: 'white' }}>Users</Tab>
            <Tab _selected={{ bg: 'brand.500', color: 'white' }}>Settings</Tab>
            <Tab _selected={{ bg: 'brand.500', color: 'white' }}>Announcements</Tab>
          </TabList>
          
          <TabPanels mt={4}>
            {/* Users Tab */}
            <TabPanel p={0}>
              <MotionBox
                p={6}
                borderRadius="xl"
                bg={cardBg}
                borderWidth="1px"
                bo
(Content truncated due to size limit. Use line ranges to read in chunks)