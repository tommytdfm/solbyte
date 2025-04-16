import React from 'react';
import {
  Box,
  Flex,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  IconButton,
  VStack,
  HStack,
  Text,
  Link,
  Icon,
  Image,
  useBreakpointValue,
  Button,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';
import { FaHome, FaChartPie, FaExchangeAlt, FaRandom, FaGamepad, FaChartLine, FaLock } from 'react-icons/fa';
import WalletConnectButton from './WalletConnectButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';

// Motion components for animations
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const { connected } = useWallet();
  
  // Responsive adjustments
  const isMobile = useBreakpointValue({ base: true, md: false });
  const sidebarWidth = useBreakpointValue({ base: '100%', md: '250px' });
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const navBgColor = useColorModeValue('white', 'gray.800');
  const activeNavBg = useColorModeValue('brand.50', 'brand.900');
  const activeNavColor = useColorModeValue('brand.600', 'brand.200');
  const navHoverBg = useColorModeValue('gray.100', 'gray.700');
  
  // Navigation items
  const navItems = [
    { name: 'Home', path: '/', icon: FaHome as React.ElementType },
    { name: 'Portfolio', path: '/portfolio', icon: FaChartPie as React.ElementType },
    { name: 'Send/Receive', path: '/send-receive', icon: FaExchangeAlt as React.ElementType },
    { name: 'Swap to ByteCoin', path: '/swap', icon: FaRandom as React.ElementType },
    { name: 'Games', path: '/games', icon: FaGamepad as React.ElementType },
    { name: 'Fees Raised', path: '/fees', icon: FaChartLine as React.ElementType },
    { name: 'Admin Panel', path: '/admin', icon: FaLock as React.ElementType, adminOnly: true }
  ];
  
  // Filter out admin panel if not connected
  const filteredNavItems = navItems.filter(item => !item.adminOnly || connected);
  
  // Sidebar content
  const SidebarContent = (
    <VStack
      h="full"
      w={sidebarWidth}
      borderRight="1px"
      borderRightColor={borderColor}
      bg={navBgColor}
      spacing={0}
      align="stretch"
    >
      {/* Logo and app name */}
      <Flex
        h="20"
        alignItems="center"
        justifyContent="center"
        px={4}
        borderBottom="1px"
        borderBottomColor={borderColor}
      >
        <MotionBox
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Heading
            as="h1"
            fontSize="xl"
            fontWeight="bold"
            bgGradient="linear(to-r, brand.500, accent.500)"
            bgClip="text"
          >
            ByteCoin on Sol
          </Heading>
        </MotionBox>
      </Flex>
      
      {/* Navigation links */}
      <VStack spacing={0} align="stretch" pt={4}>
        {filteredNavItems.map((item) => (
          <MotionFlex
            key={item.path}
            as={RouterLink}
            to={item.path}
            p={3}
            mx={2}
            borderRadius="lg"
            role="group"
            cursor="pointer"
            bg={location.pathname === item.path ? activeNavBg : 'transparent'}
            color={location.pathname === item.path ? activeNavColor : 'inherit'}
            fontWeight={location.pathname === item.path ? 'semibold' : 'normal'}
            _hover={{
              bg: location.pathname === item.path ? activeNavBg : navHoverBg,
              color: location.pathname === item.path ? activeNavColor : 'inherit'
            }}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <HStack spacing={4}>
              <Icon
                as={item.icon}
                boxSize={5}
                color={location.pathname === item.path ? 'brand.500' : 'gray.500'}
                _groupHover={{ color: location.pathname === item.path ? 'brand.500' : 'brand.400' }}
              />
              <Text>{item.name}</Text>
            </HStack>
          </MotionFlex>
        ))}
      </VStack>
      
      {/* Footer with version */}
      <Box mt="auto" p={4} fontSize="xs" color="gray.500" textAlign="center">
        <Text>v1.0.0</Text>
      </Box>
    </VStack>
  );
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton size="lg" />
          <DrawerHeader borderBottomWidth="1px">ByteCoin on Sol</DrawerHeader>
          <DrawerBody p={0}>
            {SidebarContent}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      
      {/* Desktop sidebar */}
      {!isMobile && (
        <Box
          position="fixed"
          left={0}
          w={sidebarWidth}
          h="full"
          display={{ base: 'none', md: 'block' }}
          boxShadow="xl"
        >
          {SidebarContent}
        </Box>
      )}
      
      {/* Main content area */}
      <Box ml={{ base: 0, md: sidebarWidth }}>
        {/* Top navigation bar */}
        <Flex
          as="header"
          align="center"
          justify="space-between"
          w="full"
          px={4}
          h="16"
          bg={bgColor}
          borderBottomWidth="1px"
          borderBottomColor={borderColor}
          boxShadow="sm"
        >
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              onClick={onOpen}
              variant="ghost"
              size="lg"
            />
          )}
          
          {/* App title (mobile only) */}
          {isMobile && (
            <Heading
              as="h1"
              fontSize="lg"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, accent.500)"
              bgClip="text"
            >
              ByteCoin on Sol
            </Heading>
          )}
          
          {/* Wallet connect button */}
          <Box ml="auto">
            <WalletConnectButton />
          </Box>
        </Flex>
        
        {/* Page content */}
        <Box as="main" p={6}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
