-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 14, 2025 at 12:25 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `moonbank`
--

-- --------------------------------------------------------

--
-- Table structure for table `Admin`
--

CREATE TABLE `Admin` (
  `admin_id` int(11) NOT NULL,
  `admin_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('superadmin','manager','staff') DEFAULT 'manager',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `adminverificationsummary`
-- (See below for the actual view)
--
CREATE TABLE `adminverificationsummary` (
`user_id` int(11)
,`username` varchar(50)
,`email` varchar(100)
,`approval_status` enum('active','inactive','pending')
,`approved_by` varchar(50)
,`admin_role` enum('superadmin','manager','staff')
);

-- --------------------------------------------------------

--
-- Table structure for table `Collateral`
--

CREATE TABLE `Collateral` (
  `collateral_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `property_details` text NOT NULL,
  `loan_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `collateraldetails`
-- (See below for the actual view)
--
CREATE TABLE `collateraldetails` (
`collateral_id` int(11)
,`username` varchar(50)
,`loan_amount` decimal(10,2)
,`property_details` text
,`collateral_added_date` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `groupmembershipoverview`
-- (See below for the actual view)
--
CREATE TABLE `groupmembershipoverview` (
`user_id` int(11)
,`username` varchar(50)
,`group_name` varchar(100)
,`months_saved` bigint(21)
,`borrowing_status` varchar(12)
);

-- --------------------------------------------------------

--
-- Table structure for table `Groups`
--

CREATE TABLE `Groups` (
  `group_id` int(11) NOT NULL,
  `group_name` varchar(100) NOT NULL,
  `tenure_months` int(11) DEFAULT 6,
  `min_saving_duration` int(11) DEFAULT 2,
  `max_borrow_amount` decimal(10,2) DEFAULT NULL,
  `threshold` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `JoinRequests`
--

CREATE TABLE `JoinRequests` (
  `request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `status` enum('pending','approved','denied') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `loanrequests`
-- (See below for the actual view)
--
CREATE TABLE `loanrequests` (
`loan_id` int(11)
,`username` varchar(50)
,`group_name` varchar(100)
,`requested_amount` decimal(10,2)
,`loan_status` enum('approved','pending','rejected')
,`issue_date` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `Loans`
--

CREATE TABLE `Loans` (
  `loan_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('approved','pending','rejected') DEFAULT 'pending',
  `issue_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Notifications`
--

CREATE TABLE `Notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `notification_type` enum('transaction','meeting') NOT NULL,
  `message` text NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Savings`
--

CREATE TABLE `Savings` (
  `saving_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `saving_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `transactionhistory`
-- (See below for the actual view)
--
CREATE TABLE `transactionhistory` (
`transaction_id` int(11)
,`username` varchar(50)
,`group_name` varchar(100)
,`transaction_type` enum('deposit','withdrawal','loan','repayment')
,`amount` decimal(10,2)
,`transaction_date` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `Transactions`
--

CREATE TABLE `Transactions` (
  `transaction_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `transaction_type` enum('deposit','withdrawal','loan','repayment') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `usergroupstatusview`
-- (See below for the actual view)
--
CREATE TABLE `usergroupstatusview` (
`user_id` int(11)
,`username` varchar(50)
,`email` varchar(100)
,`phone_number` varchar(15)
,`account_status` enum('active','inactive','pending')
,`account_creation_date` timestamp
,`group_name` varchar(100)
,`join_request_status` enum('pending','approved','denied')
,`request_date` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `usernotifications`
-- (See below for the actual view)
--
CREATE TABLE `usernotifications` (
`notification_id` int(11)
,`username` varchar(50)
,`notification_type` enum('transaction','meeting')
,`message` text
,`sent_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `userprofileview`
-- (See below for the actual view)
--
CREATE TABLE `userprofileview` (
`user_id` int(11)
,`username` varchar(50)
,`email` varchar(100)
,`phone_number` varchar(15)
,`account_creation_date` timestamp
,`group_name` varchar(100)
,`total_savings` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `status` enum('active','inactive','pending') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `group_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `usersavingssummary`
-- (See below for the actual view)
--
CREATE TABLE `usersavingssummary` (
`user_id` int(11)
,`username` varchar(50)
,`group_name` varchar(100)
,`total_savings` decimal(32,2)
,`max_borrow_amount` decimal(10,2)
,`max_eligible_loan` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Structure for view `adminverificationsummary`
--
DROP TABLE IF EXISTS `adminverificationsummary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `adminverificationsummary`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`username` AS `username`, `u`.`email` AS `email`, `u`.`status` AS `approval_status`, `a`.`admin_name` AS `approved_by`, `a`.`role` AS `admin_role` FROM (`users` `u` left join `admin` `a` on(`u`.`status` = 'active' and `a`.`role` in ('superadmin','manager'))) ;

-- --------------------------------------------------------

--
-- Structure for view `collateraldetails`
--
DROP TABLE IF EXISTS `collateraldetails`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `collateraldetails`  AS SELECT `c`.`collateral_id` AS `collateral_id`, `u`.`username` AS `username`, `l`.`amount` AS `loan_amount`, `c`.`property_details` AS `property_details`, `c`.`created_at` AS `collateral_added_date` FROM ((`collateral` `c` join `users` `u` on(`c`.`user_id` = `u`.`user_id`)) join `loans` `l` on(`c`.`loan_id` = `l`.`loan_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `groupmembershipoverview`
--
DROP TABLE IF EXISTS `groupmembershipoverview`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `groupmembershipoverview`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`username` AS `username`, `g`.`group_name` AS `group_name`, count(`s`.`saving_id`) AS `months_saved`, if(count(`s`.`saving_id`) >= `g`.`min_saving_duration`,'Eligible','Not Eligible') AS `borrowing_status` FROM ((`users` `u` join `savings` `s` on(`u`.`user_id` = `s`.`user_id`)) join `groups` `g` on(`s`.`group_id` = `g`.`group_id`)) GROUP BY `u`.`user_id`, `g`.`group_name` ;

-- --------------------------------------------------------

--
-- Structure for view `loanrequests`
--
DROP TABLE IF EXISTS `loanrequests`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `loanrequests`  AS SELECT `l`.`loan_id` AS `loan_id`, `u`.`username` AS `username`, `g`.`group_name` AS `group_name`, `l`.`amount` AS `requested_amount`, `l`.`status` AS `loan_status`, `l`.`issue_date` AS `issue_date` FROM ((`loans` `l` join `users` `u` on(`l`.`user_id` = `u`.`user_id`)) join `groups` `g` on(`l`.`group_id` = `g`.`group_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `transactionhistory`
--
DROP TABLE IF EXISTS `transactionhistory`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `transactionhistory`  AS SELECT `t`.`transaction_id` AS `transaction_id`, `u`.`username` AS `username`, `g`.`group_name` AS `group_name`, `t`.`transaction_type` AS `transaction_type`, `t`.`amount` AS `amount`, `t`.`transaction_date` AS `transaction_date` FROM ((`transactions` `t` join `users` `u` on(`t`.`user_id` = `u`.`user_id`)) join `groups` `g` on(`t`.`group_id` = `g`.`group_id`)) ORDER BY `t`.`transaction_date` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `usergroupstatusview`
--
DROP TABLE IF EXISTS `usergroupstatusview`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `usergroupstatusview`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`username` AS `username`, `u`.`email` AS `email`, `u`.`phone_number` AS `phone_number`, `u`.`status` AS `account_status`, `u`.`created_at` AS `account_creation_date`, `g`.`group_name` AS `group_name`, `jr`.`status` AS `join_request_status`, `jr`.`created_at` AS `request_date` FROM ((`users` `u` left join `joinrequests` `jr` on(`u`.`user_id` = `jr`.`user_id`)) left join `groups` `g` on(`jr`.`group_id` = `g`.`group_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `usernotifications`
--
DROP TABLE IF EXISTS `usernotifications`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `usernotifications`  AS SELECT `n`.`notification_id` AS `notification_id`, `u`.`username` AS `username`, `n`.`notification_type` AS `notification_type`, `n`.`message` AS `message`, `n`.`sent_at` AS `sent_at` FROM (`notifications` `n` join `users` `u` on(`n`.`user_id` = `u`.`user_id`)) ORDER BY `n`.`sent_at` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `userprofileview`
--
DROP TABLE IF EXISTS `userprofileview`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `userprofileview`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`username` AS `username`, `u`.`email` AS `email`, `u`.`phone_number` AS `phone_number`, `u`.`created_at` AS `account_creation_date`, `g`.`group_name` AS `group_name`, coalesce(sum(`s`.`amount`),0) AS `total_savings` FROM ((`users` `u` left join `groups` `g` on(`u`.`group_id` = `g`.`group_id`)) left join `savings` `s` on(`u`.`user_id` = `s`.`user_id`)) GROUP BY `u`.`user_id`, `u`.`username`, `u`.`email`, `u`.`phone_number`, `u`.`created_at`, `g`.`group_name` ;

-- --------------------------------------------------------

--
-- Structure for view `usersavingssummary`
--
DROP TABLE IF EXISTS `usersavingssummary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `usersavingssummary`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`username` AS `username`, `g`.`group_name` AS `group_name`, sum(`s`.`amount`) AS `total_savings`, `g`.`max_borrow_amount` AS `max_borrow_amount`, if(sum(`s`.`amount`) >= `g`.`max_borrow_amount`,`g`.`max_borrow_amount`,sum(`s`.`amount`)) AS `max_eligible_loan` FROM ((`users` `u` join `savings` `s` on(`u`.`user_id` = `s`.`user_id`)) join `groups` `g` on(`s`.`group_id` = `g`.`group_id`)) GROUP BY `u`.`user_id`, `g`.`group_name` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Admin`
--
ALTER TABLE `Admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `Collateral`
--
ALTER TABLE `Collateral`
  ADD PRIMARY KEY (`collateral_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `loan_id` (`loan_id`);

--
-- Indexes for table `Groups`
--
ALTER TABLE `Groups`
  ADD PRIMARY KEY (`group_id`),
  ADD UNIQUE KEY `group_name` (`group_name`);

--
-- Indexes for table `JoinRequests`
--
ALTER TABLE `JoinRequests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `Loans`
--
ALTER TABLE `Loans`
  ADD PRIMARY KEY (`loan_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `Notifications`
--
ALTER TABLE `Notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `Savings`
--
ALTER TABLE `Savings`
  ADD PRIMARY KEY (`saving_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `Transactions`
--
ALTER TABLE `Transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_group` (`group_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Admin`
--
ALTER TABLE `Admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Collateral`
--
ALTER TABLE `Collateral`
  MODIFY `collateral_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Groups`
--
ALTER TABLE `Groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `JoinRequests`
--
ALTER TABLE `JoinRequests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Loans`
--
ALTER TABLE `Loans`
  MODIFY `loan_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Notifications`
--
ALTER TABLE `Notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Savings`
--
ALTER TABLE `Savings`
  MODIFY `saving_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Transactions`
--
ALTER TABLE `Transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Collateral`
--
ALTER TABLE `Collateral`
  ADD CONSTRAINT `collateral_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `collateral_ibfk_2` FOREIGN KEY (`loan_id`) REFERENCES `Loans` (`loan_id`);

--
-- Constraints for table `JoinRequests`
--
ALTER TABLE `JoinRequests`
  ADD CONSTRAINT `joinrequests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `joinrequests_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `Groups` (`group_id`);

--
-- Constraints for table `Loans`
--
ALTER TABLE `Loans`
  ADD CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `Groups` (`group_id`);

--
-- Constraints for table `Notifications`
--
ALTER TABLE `Notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

--
-- Constraints for table `Savings`
--
ALTER TABLE `Savings`
  ADD CONSTRAINT `savings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `savings_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `Groups` (`group_id`);

--
-- Constraints for table `Transactions`
--
ALTER TABLE `Transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `Groups` (`group_id`);

--
-- Constraints for table `Users`
--
ALTER TABLE `Users`
  ADD CONSTRAINT `fk_group` FOREIGN KEY (`group_id`) REFERENCES `Groups` (`group_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
