// API Configuration
export const API_CONFIG = {
  // For development with XAMPP
  BASE_URL: "http://localhost/moonbank",
  // Note: If using React Native on physical device, you might need to use your computer's IP address
  // BASE_URL: 'http://192.168.1.xxx/moonbank', // Replace with your computer's IP

  // For production, you would change this to your actual domain
  // BASE_URL: 'https://yourdomain.com/moonbank',

  // API Endpoints
  ENDPOINTS: {
    LOGIN: "/login.php",
    SIGNUP: "/signUp.php",
    GET_USERS: "/get_all_users.php",
    ADD_TRANSACTION: "/add_transaction.php",
    LOAN_REQUESTS: "/loan_requests.php",
    SUBMIT_LOAN_REQUEST: "/submit_loan_request.php",
    ADD_SAVINGS: "/add_savings.php",
    TRANSACTION_HISTORY: "/transaction_history.php",
    USER_PROFILE: "/user_profile.php",
    USER_NOTIFICATIONS: "/user_notifications.php",
    SAVINGS_SUMMARY: "/savings_summery.php",
    GET_GROUPS: "/get_groups.php",
    CHECK_USER_GROUP: "/check_user_group.php",
    REQUEST_JOIN_GROUP: "/request_join_group.php",
    GET_USER_CONTRIBUTION: "/get_user_contribution.php",
    GET_GROUP_MEMBERS: "/get_group_members.php",
    CHANGE_PASSWORD: "/change_password.php",
    UPDATE_PROFILE: "/update_profile.php",
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
