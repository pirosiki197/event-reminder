CREATE TABLE `events` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `default_tasks` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `event_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `days_before` INT NOT NULL,
    `description` TEXT,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_task_event_id` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `holdings` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `event_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `date` DATE NOT NULL,
    `channel_id` VARCHAR(50) NOT NULL,
    `mention` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_holding_event_id` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tasks` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `holding_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `days_before` INT NOT NULL,
    `description` TEXT,
    `reminded` BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_task_holding_id` FOREIGN KEY (`holding_id`) REFERENCES `holdings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
