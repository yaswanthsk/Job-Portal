-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 28, 2025 at 12:47 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `job_portal`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `toggle_save_job` (IN `p_user_id` INT, IN `p_job_id` INT)   BEGIN
    DECLARE existing_count INT;

    -- Check if job is already saved by the user
    SELECT COUNT(*) INTO existing_count
    FROM saved_jobs
    WHERE user_id = p_user_id AND job_id = p_job_id;

    IF existing_count > 0 THEN
        -- Unsave the job
        DELETE FROM saved_jobs WHERE user_id = p_user_id AND job_id = p_job_id;
    ELSE
        -- Save the job
        INSERT INTO saved_jobs (user_id, job_id, saved_at) VALUES (p_user_id, p_job_id, NOW());
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_job` (IN `p_user_id` INT, IN `p_job_id` INT, IN `p_title` VARCHAR(255), IN `p_description` TEXT, IN `p_skills_required` TEXT, IN `p_experience_required` VARCHAR(255), IN `p_salary` INT, IN `p_location` VARCHAR(255), IN `p_job_type` VARCHAR(50))   BEGIN
    DECLARE v_company_id INT;

    -- Step 1: Get company_id for user
    SELECT company_id INTO v_company_id
    FROM companies
    WHERE user_id = p_user_id;

    IF v_company_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Company not found for this employer';
    END IF;

    -- Step 2: Check if job belongs to that company
    IF NOT EXISTS (
        SELECT 1 FROM jobs WHERE job_id = p_job_id AND company_id = v_company_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Job not found or not authorized';
    END IF;

    -- Step 3: Perform update
    UPDATE jobs
    SET 
        title = p_title,
        description = p_description,
        skills_required = p_skills_required,
        experience_required = p_experience_required,
        salary = p_salary,
        location = p_location,
        job_type = p_job_type
    WHERE job_id = p_job_id AND company_id = v_company_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `application_id` int(11) NOT NULL,
  `jobseeker_id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `application_status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`application_id`, `jobseeker_id`, `job_id`, `application_status`, `created_at`) VALUES
(7, 20, 13, 'Pending', '2025-04-28 09:57:42');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `company_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_name` varchar(255) NOT NULL,
  `company_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`company_id`, `user_id`, `company_name`, `company_description`, `created_at`) VALUES
(1, 6, 'technos', 'A random company description, like any company description, provides a concise overview of a business, including its name, location, what it does, and its value proposition. It often includes details like the company\'s history, mission statement, and legal structure. The description aims to give potential stakeholders (investors, customers, employees) a clear understanding of the company\'s purpose and offerings. ', '2025-04-15 06:07:45'),
(2, 7, 'techno', 'techno', '2025-04-15 06:08:51'),
(5, 12, 'demo', 'demodemodemo', '2025-04-25 07:19:45');

-- --------------------------------------------------------

--
-- Stand-in structure for view `employer_applications_view`
-- (See below for the actual view)
--
CREATE TABLE `employer_applications_view` (
`application_id` int(11)
,`job_id` int(11)
,`job_title` varchar(255)
,`job_location` varchar(255)
,`salary` varchar(100)
,`experience_required` varchar(100)
,`skills_required` text
,`location` varchar(255)
,`job_description` text
,`job_type` enum('Full-time','Part-time','Contract','Internship')
,`application_status` varchar(50)
,`applied_at` timestamp
,`user_id` int(11)
,`username` varchar(100)
,`email` varchar(255)
,`applicant_name` varchar(255)
,`skills` text
,`experience` varchar(255)
,`resume_link` varchar(255)
,`phone` varchar(15)
,`profile_photo` text
,`is_fresher` enum('Fresher','Experienced')
,`current_title` varchar(255)
,`willing_to_relocate` enum('Yes','No')
,`linkedin_url` varchar(255)
,`github_url` varchar(255)
,`company_id` int(11)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `employer_profile_view`
-- (See below for the actual view)
--
CREATE TABLE `employer_profile_view` (
`user_id` int(11)
,`username` varchar(100)
,`email` varchar(255)
,`profile_picture` text
,`company_name` varchar(255)
,`company_description` text
);

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `job_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `skills_required` text DEFAULT NULL,
  `experience_required` varchar(100) DEFAULT NULL,
  `salary` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `job_type` enum('Full-time','Part-time','Contract','Internship') DEFAULT 'Full-time',
  `posted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `job_status` enum('active','closed') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`job_id`, `company_id`, `title`, `description`, `skills_required`, `experience_required`, `salary`, `location`, `job_type`, `posted_at`, `job_status`) VALUES
(3, 1, 'ASSOCIATE ENGINEER', 'Looking for a fresher with good programming skills.', '.NET, C#, MSSQL', '0', '5 LPA', 'HYDERABAD', 'Full-time', '2025-04-15 03:38:17', 'active'),
(4, 1, 'DATA ENGINEER', 'Looking for Data Engineer with expertise in power bi.', 'POWER BI', '2', '10 LPA', 'DELHI', 'Full-time', '2025-04-15 03:45:06', 'active'),
(6, 1, 'DEVOPS ENGINEER', 'DEVOPS ENGINEER', 'DEVOPS', '4', '10 LPA', 'CHENNAI', 'Full-time', '2025-04-16 01:09:56', 'active'),
(7, 1, 'AZURE DEVELOPER ', 'AZURE ENGINEER', 'AZURE', '9', '27 LPA', 'BANGLORE', 'Full-time', '2025-04-16 01:09:56', 'active'),
(10, 1, 'GEN AI ASSOCIATE', 'GEN AI ASSOCIATE ', 'PYTHON', '2', '12', 'PUNE', 'Full-time', '2025-04-24 03:26:23', 'active'),
(11, 1, 'DEMO', 'DEMO DEMO DEMO DEMO DEMO', 'DEMO', '2', '5 LPA', 'HYDERABAD', 'Full-time', '2025-04-25 01:22:48', 'closed'),
(13, 1, 'demo', 'demo demo demo demo demo demo', 'demo', 'demo', '6 lpa', 'hyderabad', 'Contract', '2025-04-28 04:08:55', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `jobseekerprofile`
--

CREATE TABLE `jobseekerprofile` (
  `jobseeker_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `skills` text DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `resume_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone` varchar(15) DEFAULT NULL,
  `profile_photo` text DEFAULT NULL,
  `is_fresher` enum('Fresher','Experienced') DEFAULT NULL,
  `current_title` varchar(255) DEFAULT NULL,
  `willing_to_relocate` enum('Yes','No') NOT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `github_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobseekerprofile`
--

INSERT INTO `jobseekerprofile` (`jobseeker_id`, `user_id`, `name`, `skills`, `experience`, `location`, `resume_link`, `created_at`, `phone`, `profile_photo`, `is_fresher`, `current_title`, `willing_to_relocate`, `linkedin_url`, `github_url`) VALUES
(20, 10, 'yash', 'react', '0', 'hyd', '1745665102147.pdf', '2025-04-26 10:58:22', '9876543211', 'data:image/jpeg;base64,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', 'Fresher', 'Associate Engineer', 'Yes', 'http://www.linkedin.com', 'http://www.linkedin.com');

-- --------------------------------------------------------

--
-- Stand-in structure for view `jobseeker_applications_view`
-- (See below for the actual view)
--
CREATE TABLE `jobseeker_applications_view` (
`application_id` int(11)
,`job_id` int(11)
,`jobseeker_id` int(11)
,`job_title` varchar(255)
,`job_location` varchar(255)
,`salary` varchar(100)
,`experience_required` varchar(100)
,`skills_required` text
,`location` varchar(255)
,`job_description` text
,`job_type` enum('Full-time','Part-time','Contract','Internship')
,`application_status` varchar(50)
,`applied_at` timestamp
,`user_id` int(11)
,`username` varchar(100)
,`email` varchar(255)
,`applicant_name` varchar(255)
,`skills` text
,`experience` varchar(255)
,`resume_link` varchar(255)
,`phone` varchar(15)
,`profile_photo` text
,`is_fresher` enum('Fresher','Experienced')
,`current_title` varchar(255)
,`willing_to_relocate` enum('Yes','No')
,`linkedin_url` varchar(255)
,`github_url` varchar(255)
,`company_id` int(11)
,`company_name` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `job_details_view`
-- (See below for the actual view)
--
CREATE TABLE `job_details_view` (
`job_id` int(11)
,`company_id` int(11)
,`title` varchar(255)
,`description` text
,`skills_required` text
,`experience_required` varchar(100)
,`salary` varchar(100)
,`location` varchar(255)
,`job_type` enum('Full-time','Part-time','Contract','Internship')
,`posted_at` timestamp
,`job_status` enum('active','closed')
,`company_name` varchar(255)
,`company_description` text
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `job_stats_view`
-- (See below for the actual view)
--
CREATE TABLE `job_stats_view` (
`company_id` int(11)
,`totalJobs` bigint(21)
,`activeJobs` bigint(21)
,`totalApplications` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `saved_jobs`
--

CREATE TABLE `saved_jobs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('seeker','employer') NOT NULL DEFAULT 'seeker',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `profile_picture` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `profile_picture`) VALUES
(4, 'ram', 'ram@gmail.com', '$2b$10$oQJB/crdf5gFnhx2aQdxM.KQ3wtGLhSgvNzf4O/vKJTUYZIhfCE/a', 'employer', '2025-04-14 11:10:38', NULL),
(6, 'sam', 'sam@gmail.com', '$2b$10$m7giwOthBTEPOs1T4UCH3e82Oj0d0r72.q16af5UgKmCthMuGcO6K', 'employer', '2025-04-15 06:07:45', 'data:image/png;base64,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'),
(7, 'jam', 'jam@gmail.com', '$2b$10$Hl5YXr5jozl7eCT0PvuuQu1nuZj1VrKhnCXINzMNG7iDh8Q0W.Nvm', 'employer', '2025-04-15 06:08:51', 'data:image/png;base64,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'),
(10, 'yash', 'yash@gmail.com', '$2b$10$g934EFHstw.kzm48Cak8MOJCc3mNpL4p/Be5pGsGnz/doWAlRjITq', 'seeker', '2025-04-17 06:59:32', NULL),
(12, 'demo', 'demo@gmail.com', '$2b$10$pDSObS2sExiuSp7vUQbol.rhBC2vnvgYo8P.oaTGIkiew01EDRjyy', 'employer', '2025-04-25 07:19:45', NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_saved_jobs_detailed`
-- (See below for the actual view)
--
CREATE TABLE `v_saved_jobs_detailed` (
`user_id` int(11)
,`saved_at` timestamp
,`job_id` int(11)
,`title` varchar(255)
,`description` text
,`salary` varchar(100)
,`location` varchar(255)
,`experience_required` varchar(100)
,`job_type` enum('Full-time','Part-time','Contract','Internship')
,`posted_at` timestamp
,`company_name` varchar(255)
);

-- --------------------------------------------------------

--
-- Structure for view `employer_applications_view`
--
DROP TABLE IF EXISTS `employer_applications_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `employer_applications_view`  AS SELECT `a`.`application_id` AS `application_id`, `a`.`job_id` AS `job_id`, `j`.`title` AS `job_title`, `j`.`location` AS `job_location`, `j`.`salary` AS `salary`, `j`.`experience_required` AS `experience_required`, `j`.`skills_required` AS `skills_required`, `j`.`location` AS `location`, `j`.`description` AS `job_description`, `j`.`job_type` AS `job_type`, `a`.`application_status` AS `application_status`, `a`.`created_at` AS `applied_at`, `u`.`id` AS `user_id`, `u`.`username` AS `username`, `u`.`email` AS `email`, `jp`.`name` AS `applicant_name`, `jp`.`skills` AS `skills`, `jp`.`experience` AS `experience`, `jp`.`resume_link` AS `resume_link`, `jp`.`phone` AS `phone`, `jp`.`profile_photo` AS `profile_photo`, `jp`.`is_fresher` AS `is_fresher`, `jp`.`current_title` AS `current_title`, `jp`.`willing_to_relocate` AS `willing_to_relocate`, `jp`.`linkedin_url` AS `linkedin_url`, `jp`.`github_url` AS `github_url`, `j`.`company_id` AS `company_id` FROM ((((`applications` `a` join `jobs` `j` on(`a`.`job_id` = `j`.`job_id`)) join `companies` `c` on(`j`.`company_id` = `c`.`company_id`)) join `jobseekerprofile` `jp` on(`a`.`jobseeker_id` = `jp`.`jobseeker_id`)) join `users` `u` on(`jp`.`user_id` = `u`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `employer_profile_view`
--
DROP TABLE IF EXISTS `employer_profile_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `employer_profile_view`  AS SELECT `u`.`id` AS `user_id`, `u`.`username` AS `username`, `u`.`email` AS `email`, `u`.`profile_picture` AS `profile_picture`, `c`.`company_name` AS `company_name`, `c`.`company_description` AS `company_description` FROM (`users` `u` left join `companies` `c` on(`u`.`id` = `c`.`user_id`)) WHERE `u`.`role` = 'employer' ;

-- --------------------------------------------------------

--
-- Structure for view `jobseeker_applications_view`
--
DROP TABLE IF EXISTS `jobseeker_applications_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `jobseeker_applications_view`  AS SELECT `a`.`application_id` AS `application_id`, `a`.`job_id` AS `job_id`, `a`.`jobseeker_id` AS `jobseeker_id`, `j`.`title` AS `job_title`, `j`.`location` AS `job_location`, `j`.`salary` AS `salary`, `j`.`experience_required` AS `experience_required`, `j`.`skills_required` AS `skills_required`, `j`.`location` AS `location`, `j`.`description` AS `job_description`, `j`.`job_type` AS `job_type`, `a`.`application_status` AS `application_status`, `a`.`created_at` AS `applied_at`, `u`.`id` AS `user_id`, `u`.`username` AS `username`, `u`.`email` AS `email`, `jp`.`name` AS `applicant_name`, `jp`.`skills` AS `skills`, `jp`.`experience` AS `experience`, `jp`.`resume_link` AS `resume_link`, `jp`.`phone` AS `phone`, `jp`.`profile_photo` AS `profile_photo`, `jp`.`is_fresher` AS `is_fresher`, `jp`.`current_title` AS `current_title`, `jp`.`willing_to_relocate` AS `willing_to_relocate`, `jp`.`linkedin_url` AS `linkedin_url`, `jp`.`github_url` AS `github_url`, `c`.`company_id` AS `company_id`, `c`.`company_name` AS `company_name` FROM ((((`applications` `a` join `jobs` `j` on(`a`.`job_id` = `j`.`job_id`)) join `companies` `c` on(`j`.`company_id` = `c`.`company_id`)) join `jobseekerprofile` `jp` on(`a`.`jobseeker_id` = `jp`.`jobseeker_id`)) join `users` `u` on(`jp`.`user_id` = `u`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `job_details_view`
--
DROP TABLE IF EXISTS `job_details_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `job_details_view`  AS SELECT `j`.`job_id` AS `job_id`, `j`.`company_id` AS `company_id`, `j`.`title` AS `title`, `j`.`description` AS `description`, `j`.`skills_required` AS `skills_required`, `j`.`experience_required` AS `experience_required`, `j`.`salary` AS `salary`, `j`.`location` AS `location`, `j`.`job_type` AS `job_type`, `j`.`posted_at` AS `posted_at`, `j`.`job_status` AS `job_status`, `c`.`company_name` AS `company_name`, `c`.`company_description` AS `company_description` FROM (`jobs` `j` join `companies` `c` on(`j`.`company_id` = `c`.`company_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `job_stats_view`
--
DROP TABLE IF EXISTS `job_stats_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `job_stats_view`  AS SELECT `j`.`company_id` AS `company_id`, count(0) AS `totalJobs`, count(case when `j`.`job_status` = 'active' then 1 end) AS `activeJobs`, count(distinct `a`.`job_id`) AS `totalApplications` FROM (`jobs` `j` left join `applications` `a` on(`j`.`job_id` = `a`.`job_id`)) GROUP BY `j`.`company_id` ;

-- --------------------------------------------------------

--
-- Structure for view `v_saved_jobs_detailed`
--
DROP TABLE IF EXISTS `v_saved_jobs_detailed`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_saved_jobs_detailed`  AS SELECT `s`.`user_id` AS `user_id`, `s`.`saved_at` AS `saved_at`, `j`.`job_id` AS `job_id`, `j`.`title` AS `title`, `j`.`description` AS `description`, `j`.`salary` AS `salary`, `j`.`location` AS `location`, `j`.`experience_required` AS `experience_required`, `j`.`job_type` AS `job_type`, `j`.`posted_at` AS `posted_at`, `c`.`company_name` AS `company_name` FROM ((`saved_jobs` `s` join `jobs` `j` on(`s`.`job_id` = `j`.`job_id`)) join `companies` `c` on(`j`.`company_id` = `c`.`company_id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`application_id`),
  ADD KEY `jobseeker_id` (`jobseeker_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`company_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`job_id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `jobseekerprofile`
--
ALTER TABLE `jobseekerprofile`
  ADD PRIMARY KEY (`jobseeker_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_saved_job` (`user_id`,`job_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `application_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `company_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `job_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `jobseekerprofile`
--
ALTER TABLE `jobseekerprofile`
  MODIFY `jobseeker_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`jobseeker_id`) REFERENCES `jobseekerprofile` (`jobseeker_id`),
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`);

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE;

--
-- Constraints for table `jobseekerprofile`
--
ALTER TABLE `jobseekerprofile`
  ADD CONSTRAINT `jobseekerprofile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD CONSTRAINT `saved_jobs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `saved_jobs_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
