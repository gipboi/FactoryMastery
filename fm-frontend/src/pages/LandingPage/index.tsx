import {
  Badge,
  Box,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import AvatarBoy from "assets/icons/avatar-boy.svg";
import AvatarGirl from "assets/icons/avatar-girl.svg";
import WorkFlow from "assets/icons/effective.svg";
import DashBoard from "assets/images/dashboard.png";
import MobileApp from "assets/images/mobile.png";
import MultiDevices from "assets/images/multi-devices.png";
import DataAnalyst from "assets/images/report.jpg";
import RoadMap from "assets/images/roadmap.png";
import TextLogo from "assets/images/text-logo.png";
import { useStores } from "hooks/useStores";
import { useRef } from "react";
import {
  FaBars,
  FaBell,
  FaChartBar,
  FaChartLine,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import routes from "routes";
import { getSubdomain } from "utils/domain";
import styles from "./landingPage.module.scss";
const LandingPage = () => {
  const navigate = useNavigate();
  const subdomain = getSubdomain();
  const mainhost = window.location.host
    .replace(/^(www\.)/, "")
    .replace(new RegExp(`^(${subdomain}\\.)`), "");

  // Custom theme colors
  const primary300 = "#75BDE0";
  const primary500 = "#4A8DB7";
  const primary700 = "#387097";

  const { organizationStore } = useStores();
  const bgColor = useColorModeValue("blue.50", "blue.900");
  const { organization } = organizationStore;

  // Mobile menu drawer
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  // Handle sign up button click
  const handleSignUpClick = () => {
    navigate(routes.signUp.value);
  };

  return (
    <Box className={styles.landingPage}>
      {/* Header */}
      <Box as="header" className={styles.header}>
        <Container maxW="container.xl">
          <Flex align="center" justify="space-between" py={4}>
            <Flex align="center">
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Flex align="center">
                  <Image
                    src={TextLogo || "/placeholder.svg"}
                    alt="Logo"
                    h="40px"
                  />
                </Flex>
              </Link>
            </Flex>

            {/* Desktop Navigation */}
            <Flex display={{ base: "none", md: "flex" }}>
              <Link
                href="#features"
                mx={4}
                fontWeight="medium"
                _hover={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: primary700,
                }}
              >
                Features
              </Link>
              <Link
                href="#mobile"
                mx={4}
                fontWeight="medium"
                _hover={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: primary700,
                }}
              >
                Mobile
              </Link>
              <Link
                href="#testimonials"
                mx={4}
                fontWeight="medium"
                _hover={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: primary700,
                }}
              >
                Customers
              </Link>
              <Link
                href="#pricing"
                mx={4}
                fontWeight="medium"
                _hover={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: primary700,
                }}
              >
                Pricing
              </Link>
            </Flex>

            <Flex>
              {/* Mobile menu button */}
              <IconButton
                ref={btnRef}
                aria-label="Open menu"
                icon={<FaBars />}
                display={{ base: "flex", md: "none" }}
                variant="ghost"
                onClick={onOpen}
                mr={2}
              />

              <Button
                variant="ghost"
                mr={2}
                onClick={() =>
                  (window.location.href = `${window.location.protocol}//app.${mainhost}`)
                }
                colorScheme="primary"
                _hover={{ bg: primary700, textColor: "white" }}
                className={styles.ctaButton}
                display={{ base: "none", sm: "flex" }}
              >
                Login
              </Button>
              <Button
                colorScheme="primary"
                className={styles.ctaButton}
                display={{ base: "none", sm: "flex" }}
                onClick={handleSignUpClick}
              >
                Sign Up
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                onClose(); // Close the drawer after clicking
              }}
            >
              <Flex align="center">
                <Image
                  src={TextLogo || "/placeholder.svg"}
                  alt="Logo"
                  h="30px"
                />
              </Flex>
            </Link>
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing={4} mt={4}>
              <Link
                href="#features"
                fontWeight="medium"
                onClick={onClose}
                _hover={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: primary700,
                }}
              >
                Features
              </Link>
              <Link
                href="#mobile"
                fontWeight="medium"
                onClick={onClose}
                _hover={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: primary700,
                }}
              >
                Mobile
              </Link>
              <Link
                href="#testimonials"
                fontWeight="medium"
                onClick={onClose}
                _hover={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: primary700,
                }}
              >
                Customers
              </Link>
              <Link
                href="#pricing"
                fontWeight="medium"
                onClick={onClose}
                _hover={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: primary700,
                }}
              >
                Pricing
              </Link>
              <Button
                colorScheme="blue"
                bg={primary500}
                _hover={{ bg: primary700 }}
                className={styles.ctaButton}
                mt={4}
                onClick={() =>
                  (window.location.href = `${window.location.protocol}//app.${mainhost}`)
                }
              >
                Login
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Hero Section */}
      <Box
        id="top"
        className={styles.heroSection}
        bg={bgColor}
        py={{ base: 10, md: 16 }}
      >
        <Container maxW="container.xl">
          <Flex direction={{ base: "column", lg: "row" }} align="center">
            <Box flex="1" pr={{ lg: 12 }} mb={{ base: 10, lg: 0 }}>
              <Heading
                as="h1"
                size={{ base: "xl", md: "2xl" }}
                mb={4}
                className={styles.heroTitle}
              >
                Manage your processes
              </Heading>
              <Heading
                as="h2"
                size={{ base: "lg", md: "xl" }}
                color={primary300}
                mb={6}
                fontWeight="normal"
              >
                With ease
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} mb={8} color="gray.600">
                Streamline workflows and processes, enhance tracking, and unlock
                your team's potential with FactoryMastery's comprehensive
                process management solution.
              </Text>
              <Flex direction={{ base: "column", sm: "row" }} gap={4}>
                <Button
                  size={{ base: "md", md: "lg" }}
                  colorScheme="blue"
                  bg={primary500}
                  _hover={{ bg: primary700 }}
                  className={styles.ctaButton}
                  px={8}
                  w={{ base: "full", sm: "auto" }}
                  onClick={handleSignUpClick}
                >
                  Schedule a Demo
                </Button>
              </Flex>
            </Box>
            <Box flex="1" className={styles.heroImage}>
              <Image
                src={DashBoard}
                alt="Dashboard"
                className={styles.dashboardImage}
                shadow="xl"
                borderRadius="md"
              />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Features Icons */}
      <Box py={{ base: 6, md: 10 }} className={styles.featuresIcons}>
        <Container maxW="container.xl">
          <SimpleGrid
            columns={{ base: 2, md: 5 }}
            spacing={{ base: 4, md: 8 }}
            className={styles.iconGrid}
          >
            <Flex align="center" className={styles.featureIcon}>
              <Icon as={FaCheckCircle} color="gray.400" mr={2} />
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                Intuitive User Interface
              </Text>
            </Flex>
            <Flex align="center" className={styles.featureIcon}>
              <Icon as={FaCheckCircle} color="gray.400" mr={2} />
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                Workflow Automation
              </Text>
            </Flex>
            <Flex align="center" className={styles.featureIcon}>
              <Icon as={FaCheckCircle} color="gray.400" mr={2} />
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                Real-time Interaction
              </Text>
            </Flex>
            <Flex align="center" className={styles.featureIcon}>
              <Icon as={FaCheckCircle} color="gray.400" mr={2} />
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                Reports & Analytics
              </Text>
            </Flex>
            <Flex align="center" className={styles.featureIcon}>
              <Icon as={FaCheckCircle} color="gray.400" mr={2} />
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                Customizable Processes
              </Text>
            </Flex>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Simplify Operations */}
      <Box
        id="features"
        py={{ base: 10, md: 16 }}
        className={styles.simplifySection}
      >
        <Container maxW="container.xl" textAlign="center">
          <Heading as="h2" size={{ base: "lg", md: "xl" }} mb={2}>
            Simplify{" "}
            <Text as="span" color={primary300}>
              Your Operations
            </Text>
          </Heading>
          <Text mb={{ base: 8, md: 12 }} color="gray.600">
            Simple. Streamlined. Success - With Real-World Results
          </Text>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={{ base: 6, md: 10 }}
            className={styles.featureCards}
          >
            <VStack
              align="start"
              className={styles.featureCard}
              textAlign="left"
              alignItems="flex-start"
              spacing={2}
            >
              <Box
                className={styles.featureIconBox}
                bg={`${primary300}20`}
                p={4}
                borderRadius="md"
              >
                <Icon
                  as={FaChartLine}
                  color={primary500}
                  boxSize={{ base: 6, md: 8 }}
                />
              </Box>
              <Heading as="h3" size="md" mt={4} mb={2} textAlign="left">
                Powerful Dashboard
              </Heading>
              <Text color="gray.600" textAlign="left">
                Consolidated dashboard with intuitive controls, real-time
                updates, streamlining workflow management and optimization.
              </Text>
            </VStack>

            <VStack
              align="start"
              className={styles.featureCard}
              textAlign="left"
              alignItems="flex-start"
              spacing={2}
            >
              <Box
                className={styles.featureIconBox}
                bg={`${primary300}20`}
                p={4}
                borderRadius="md"
              >
                <Icon
                  as={FaChartBar}
                  color={primary500}
                  boxSize={{ base: 6, md: 8 }}
                />
              </Box>
              <Heading as="h3" size="md" mt={4} mb={2} textAlign="left">
                Detailed Metrics
              </Heading>
              <Text color="gray.600" textAlign="left">
                Track detailed metrics, including performance indicators,
                process efficiency, and team collaboration optimization.
              </Text>
            </VStack>

            <VStack
              align="start"
              className={styles.featureCard}
              textAlign="left"
              alignItems="flex-start"
              spacing={2}
            >
              <Box
                className={styles.featureIconBox}
                bg={`${primary300}20`}
                p={4}
                borderRadius="md"
              >
                <Icon
                  as={FaBell}
                  color={primary500}
                  boxSize={{ base: 6, md: 8 }}
                />
              </Box>
              <Heading as="h3" size="md" mt={4} mb={2} textAlign="left">
                Real-time Notifications
              </Heading>
              <Text color="gray.600" textAlign="left">
                Receive real-time alerts for process updates, task completions,
                and system level status changes for better oversight.
              </Text>
            </VStack>

            <VStack
              align="start"
              className={styles.featureCard}
              textAlign="left"
              alignItems="flex-start"
              spacing={2}
            >
              <Box
                className={styles.featureIconBox}
                bg={`${primary300}20`}
                p={4}
                borderRadius="md"
              >
                <Icon
                  as={FaUsers}
                  color={primary500}
                  boxSize={{ base: 6, md: 8 }}
                />
              </Box>
              <Heading as="h3" size="md" mt={4} mb={2} textAlign="left">
                Custom Branding
              </Heading>
              <Text color="gray.600" textAlign="left">
                Extend your logo, customize your interface, and create a
                professional experience for your team.
              </Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Mobile Friendly */}
      <Box
        id="mobile"
        py={{ base: 10, md: 16 }}
        className={styles.mobileSection}
      >
        <Container maxW="container.xl">
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 6, md: 10 }}
          >
            <Box className={styles.mobileContent}>
              <Heading
                as="h2"
                size={{ base: "lg", md: "xl" }}
                mb={{ base: 4, md: 6 }}
              >
                Mobile-Friendly System
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                mb={{ base: 4, md: 6 }}
                color="gray.600"
              >
                Access your processes on any device, ensuring seamless,
                efficient workflow on the go.
              </Text>
              <Image
                src={MultiDevices}
                alt="Responsive Design"
                className={styles.devicesImage}
              />
            </Box>
            <Box className={styles.mobileImageContainer}>
              <Image
                src={MobileApp || "/placeholder.svg"}
                alt="Mobile App"
                className={styles.mobileImage}
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Workflow Management */}
      <Box
        py={{ base: 10, md: 16 }}
        bg="gray.50"
        className={styles.workflowSection}
      >
        <Container maxW="container.xl">
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 6, md: 10 }}
          >
            <Box
              className={styles.workflowImageContainer}
              order={{ base: 2, lg: 1 }}
            >
              <Image
                src={WorkFlow || "/placeholder.svg"}
                alt="Workflow"
                className={styles.workflowImage}
              />
            </Box>
            <Box className={styles.workflowContent} order={{ base: 1, lg: 2 }}>
              <Heading
                as="h2"
                size={{ base: "lg", md: "xl" }}
                mb={{ base: 4, md: 6 }}
              >
                Efficient workflow management
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                mb={{ base: 4, md: 6 }}
                color="gray.600"
              >
                Streamline process flows with intuitive interfaces that make
                complex operations simple to manage and execute.
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Unlock Potential */}
      <Box py={{ base: 10, md: 16 }} className={styles.unlockSection}>
        <Container maxW="container.xl" textAlign="center">
          <Heading as="h2" size={{ base: "lg", md: "xl" }} mb={2}>
            Unlock{" "}
            <Text as="span" color={primary300}>
              Your Potential With Our System
            </Text>
          </Heading>
          <Text mb={{ base: 8, md: 12 }} color="gray.600">
            Streamline processes, maximize results, and achieve excellence with
            our trusted solution
          </Text>

          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 6, md: 10 }}
            mt={{ base: 8, md: 16 }}
          >
            <Box
              className={styles.improvementBox}
              p={{ base: 6, md: 8 }}
              borderRadius="lg"
              bg="white"
              shadow="md"
              textAlign="center"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Heading
                as="h3"
                size={{ base: "md", md: "lg" }}
                mb={{ base: 4, md: 6 }}
                textAlign="center"
              >
                Improve processes while barely lifting a finger
              </Heading>
              <Text
                color="gray.600"
                mb={{ base: 4, md: 6 }}
                textAlign="center"
                maxWidth="90%"
                mx="auto"
              >
                Our intuitive system guides you through each step of your
                process optimization journey. With just a few clicks, you can
                transform the way teams of people collaborate, communicate, and
                deliver exceptional results.
              </Text>
            </Box>
            <Box
              className={styles.statsBox}
              p={{ base: 6, md: 8 }}
              borderRadius="lg"
              bg="white"
              shadow="md"
            >
              <VStack spacing={{ base: 6, md: 8 }} align="stretch">
                <Box
                  p={{ base: 4, md: 6 }}
                  borderRadius="md"
                  bg={`${primary300}20`}
                >
                  <Badge colorScheme="blue" mb={2}>
                    Performance Gain
                  </Badge>
                  <Heading size={{ base: "lg", md: "xl" }}>53%</Heading>
                  <Text color="gray.600">Average efficiency improvement</Text>
                </Box>
                <Box p={{ base: 4, md: 6 }} borderRadius="md" bg="yellow.50">
                  <Badge colorScheme="yellow" mb={2}>
                    Time Saved
                  </Badge>
                  <Heading size={{ base: "lg", md: "xl" }}>1200</Heading>
                  <Text color="gray.600">Hours saved monthly</Text>
                </Box>
              </VStack>
            </Box>
          </SimpleGrid>

          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={{ base: 6, md: 10 }}
            mt={{ base: 8, md: 16 }}
            bg="white"
            borderRadius="lg"
            shadow="md"
            overflow="hidden"
          >
            <Box
              p={{ base: 6, md: 8 }}
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <Heading
                as="h3"
                size={{ base: "md", md: "lg" }}
                mb={{ base: 4, md: 6 }}
              >
                Data-driven continuous improvement
              </Heading>
              <Text color="gray.600">
                We use real-time data analysis to identify your process
                bottlenecks and help you make data-driven decisions to improve
                your team's efficiency. Our tools make it easy to implement
                changes, track their impact, and iterate for better results.
              </Text>
            </Box>
            <Box
              bg={`${primary300}10`}
              p={{ base: 4, md: 6 }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src={DataAnalyst}
                alt="Data-driven improvement analytics"
                borderRadius="md"
                maxHeight="300px"
                objectFit="contain"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box
        id="testimonials"
        py={{ base: 10, md: 16 }}
        bg="gray.100"
        className={styles.testimonialsSection}
      >
        <Container maxW="container.xl">
          <Heading
            as="h2"
            size={{ base: "lg", md: "xl" }}
            mb={2}
            textAlign="center"
          >
            Real experience{" "}
            <Text as="span" color={primary300}>
              from happy clients
            </Text>
          </Heading>
          <Text mb={{ base: 8, md: 12 }} textAlign="center" color="gray.600">
            See proven results from companies who have streamlined their
            processes, reduced costs, and accelerated growth
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 6, md: 8 }}>
            <Box
              p={{ base: 6, md: 8 }}
              bg="white"
              borderRadius="lg"
              shadow="md"
              className={styles.testimonial}
            >
              <Text fontSize={{ base: "md", md: "lg" }} mb={{ base: 4, md: 6 }}>
                "How do we know what we know and how do we keep that knowledge
                for the long term? How do we ensure that knowledge is accessible
                to everyone who needs it? We use FactoryMastery to help us
                capture, share, and communicate around the work and help the
                knowledge get to everyone."
              </Text>
              <Flex align="center">
                <Image
                  src={AvatarBoy || "/placeholder.svg"}
                  alt="Avatar"
                  borderRadius="full"
                  boxSize={{ base: "40px", md: "50px" }}
                  mr={4}
                />
                <Box>
                  <Text fontWeight="bold">John Smith</Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                    CTO, Acme Inc
                  </Text>
                </Box>
              </Flex>
            </Box>
            <Box
              p={{ base: 6, md: 8 }}
              bg="white"
              borderRadius="lg"
              shadow="md"
              className={styles.testimonial}
            >
              <Text fontSize={{ base: "md", md: "lg" }} mb={{ base: 4, md: 6 }}>
                "The platform has completely transformed our operations. Our
                team's productivity has increased by 40% since implementing
                FactoryMastery. It's an essential tool for any company looking
                to scale efficiently."
              </Text>
              <Flex align="center">
                <Image
                  src={AvatarGirl || "/placeholder.svg"}
                  alt="Avatar"
                  borderRadius="full"
                  boxSize={{ base: "40px", md: "50px" }}
                  mr={4}
                />
                <Box>
                  <Text fontWeight="bold">Sarah Johnson</Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                    COO, TechSolutions
                  </Text>
                </Box>
              </Flex>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing */}
      <Box
        id="pricing"
        py={{ base: 10, md: 16 }}
        className={styles.pricingSection}
      >
        <Container maxW="container.xl" textAlign="center">
          <Heading
            as="h2"
            size={{ base: "lg", md: "xl" }}
            mb={{ base: 4, md: 6 }}
          >
            Plans & Pricing
          </Heading>
          <Text mb={{ base: 8, md: 12 }} color="gray.600">
            Choose the plan that works best for your team's needs
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }}>
            <Box
              p={{ base: 6, md: 8 }}
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
              className={styles.pricingCard}
              display="flex"
              flexDirection="column"
              height="100%"
            >
              <Heading as="h3" size="md" mb={4}>
                Free Plan
              </Heading>
              <VStack spacing={4} align="stretch" mb={8} flex="1">
                <Text>Limited features</Text>
                <Text>Up to 5 users</Text>
                <Text>Basic support</Text>
              </VStack>
              <Button
                colorScheme="blue"
                bg={primary500}
                _hover={{ bg: primary700 }}
                variant="outline"
                size={{ base: "md", md: "lg" }}
                width="full"
                textColor="white"
                mt="auto"
              >
                Get Started
              </Button>
            </Box>
            <Box
              p={{ base: 6, md: 8 }}
              borderRadius="lg"
              border="1px"
              borderColor={`${primary300}`}
              bg={`${primary300}15`}
              className={styles.pricingCard}
              display="flex"
              flexDirection="column"
              height="100%"
            >
              <Heading as="h3" size="md" mb={4}>
                Paid Plan
              </Heading>
              <VStack spacing={4} align="stretch" mb={8} flex="1">
                <Text>All features</Text>
                <Text>Unlimited users</Text>
                <Text>Priority support</Text>
                <Text>Advanced analytics</Text>
              </VStack>
              <Button
                colorScheme="blue"
                bg={primary500}
                _hover={{ bg: primary700 }}
                size={{ base: "md", md: "lg" }}
                width="full"
                mt="auto"
              >
                Contact Sales
              </Button>
            </Box>
            <Box
              p={{ base: 6, md: 8 }}
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
              className={styles.pricingCard}
              display="flex"
              flexDirection="column"
              height="100%"
            >
              <Heading as="h3" size="md" mb={4}>
                Enterprise Plan
              </Heading>
              <VStack spacing={4} align="stretch" mb={8} flex="1">
                <Text>Custom solutions</Text>
                <Text>Dedicated support</Text>
                <Text>SLA guarantees</Text>
                <Text>On-premise options</Text>
              </VStack>
              <Button
                colorScheme="blue"
                bg={primary500}
                _hover={{ bg: primary700 }}
                variant="outline"
                size={{ base: "md", md: "lg" }}
                width="full"
                textColor="white"
                mt="auto"
              >
                Contact Sales
              </Button>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Roadmap */}
      <Box
        py={{ base: 10, md: 16 }}
        bg="gray.50"
        className={styles.roadmapSection}
      >
        <Container maxW="container.xl">
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 6, md: 10 }}
          >
            <Box className={styles.roadmapImage}>
              <Image src={RoadMap || "/placeholder.svg"} alt="Roadmap" />
            </Box>
            <Box className={styles.roadmapContent}>
              <Heading
                as="h2"
                size={{ base: "lg", md: "xl" }}
                mb={{ base: 4, md: 6 }}
              >
                Explore Our Vision: The Roadmap
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                mb={{ base: 4, md: 6 }}
                color="gray.600"
              >
                See what we have coming next
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA */}
      <Box py={{ base: 10, md: 16 }} className={styles.ctaSection}>
        <Container maxW="container.xl">
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: "column", md: "row" }}
          >
            <Heading as="h2" size={{ base: "lg", md: "xl" }}>
              Boost efficiency now!
            </Heading>
            <Button
              colorScheme="blue"
              bg={primary500}
              _hover={{ bg: primary700 }}
              size={{ base: "md", md: "lg" }}
              mt={{ base: 6, md: 0 }}
              onClick={handleSignUpClick}
            >
              Sign Up
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        as="footer"
        bg="gray.100"
        py={{ base: 6, md: 8 }}
        className={styles.footer}
      >
        <Container maxW="container.xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "center", md: "flex-start" }}
          >
            <Box mb={{ base: 6, md: 0 }}>
              <Flex align="center" mb={4}>
                <Image
                  src={TextLogo || "/placeholder.svg"}
                  alt="Logo"
                  h="30px"
                />
              </Flex>
              <Text color="gray.600" fontSize="sm">
                © {new Date().getFullYear()} FactoryMastery. All rights
                reserved.
              </Text>
            </Box>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
