-- ============================================
-- 物流管理系统 - 数据库建表脚本
-- 数据库名：lms
-- 建表顺序：角色表 → 用户表 → 车辆表 → 订单表 → 调度表 → 轨迹记录表
-- ============================================

CREATE DATABASE IF NOT EXISTS lms DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
USE lms;

-- -------------------------------------------
-- 1. 角色表 (sys_role)
-- -------------------------------------------
DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    role_code VARCHAR(20) NOT NULL UNIQUE COMMENT '角色代码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- -------------------------------------------
-- 2. 用户表 (sys_user)
-- -------------------------------------------
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    status TINYINT DEFAULT 1 COMMENT '状态：0禁用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_role_id (role_id),
    INDEX idx_status (status),
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES sys_role(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- -------------------------------------------
-- 3. 车辆表 (veh_vehicle)
-- -------------------------------------------
DROP TABLE IF EXISTS veh_vehicle;
CREATE TABLE veh_vehicle (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '车辆ID',
    plate_number VARCHAR(20) NOT NULL UNIQUE COMMENT '车牌号',
    vehicle_type VARCHAR(20) NOT NULL DEFAULT 'TRUCK' COMMENT '车辆类型：TRUCK/VAN/PICKUP',
    load_capacity DECIMAL(10,2) COMMENT '载重（吨）',
    driver_id BIGINT COMMENT '绑定司机ID',
    status VARCHAR(20) DEFAULT 'IDLE' COMMENT '状态：IDLE空闲/BUSY运输中/MAINTENANCE维修',
    last_location VARCHAR(200) COMMENT '最后位置',
    last_update_time DATETIME COMMENT '位置更新时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_plate_number (plate_number),
    INDEX idx_status (status),
    INDEX idx_driver_id (driver_id),
    CONSTRAINT fk_veh_driver FOREIGN KEY (driver_id) REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆表';

-- -------------------------------------------
-- 4. 订单表 (ord_order)
-- -------------------------------------------
DROP TABLE IF EXISTS ord_order;
CREATE TABLE ord_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
    shipper_name VARCHAR(50) NOT NULL COMMENT '发货人姓名',
    shipper_phone VARCHAR(20) NOT NULL COMMENT '发货人电话',
    shipper_address VARCHAR(200) NOT NULL COMMENT '发货详细地址',
    receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    receiver_phone VARCHAR(20) NOT NULL COMMENT '收货人电话',
    receiver_address VARCHAR(200) NOT NULL COMMENT '收货详细地址',
    goods_type VARCHAR(50) COMMENT '货物类型',
    weight DECIMAL(10,2) COMMENT '货物重量（吨）',
    volume DECIMAL(10,2) COMMENT '货物体积（方）',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态',
    dispatch_id BIGINT COMMENT '关联调度单ID（允许为空，不建立外键约束，避免循环引用）',
    customer_id BIGINT COMMENT '下单客户ID',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_customer_id (customer_id),
    INDEX idx_create_time (create_time),
    INDEX idx_dispatch_id (dispatch_id),
    CONSTRAINT fk_ord_customer FOREIGN KEY (customer_id) REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- -------------------------------------------
-- 5. 调度表 (dis_dispatch)
-- -------------------------------------------
DROP TABLE IF EXISTS dis_dispatch;
CREATE TABLE dis_dispatch (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '调度ID',
    dispatch_no VARCHAR(50) NOT NULL UNIQUE COMMENT '调度单号',
    order_id BIGINT NOT NULL COMMENT '关联订单ID',
    vehicle_id BIGINT NOT NULL COMMENT '分配车辆ID',
    driver_id BIGINT NOT NULL COMMENT '分配司机ID',
    status VARCHAR(20) DEFAULT 'ASSIGNED' COMMENT '状态',
    current_location VARCHAR(200) COMMENT '当前位置',
    estimated_departure_time DATETIME COMMENT '预计发车时间',
    estimated_arrival_time DATETIME COMMENT '预计到达时间',
    actual_departure_time DATETIME COMMENT '实际发车时间',
    actual_arrival_time DATETIME COMMENT '实际到达时间',
    sign_name VARCHAR(50) COMMENT '签收人姓名',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_dispatch_no (dispatch_no),
    INDEX idx_order_id (order_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_status (status),
    CONSTRAINT fk_dis_order FOREIGN KEY (order_id) REFERENCES ord_order(id),
    CONSTRAINT fk_dis_vehicle FOREIGN KEY (vehicle_id) REFERENCES veh_vehicle(id),
    CONSTRAINT fk_dis_driver FOREIGN KEY (driver_id) REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='调度表';

-- -------------------------------------------
-- 6. 轨迹记录表 (dis_location_log)
-- -------------------------------------------
DROP TABLE IF EXISTS dis_location_log;
CREATE TABLE dis_location_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '轨迹ID',
    dispatch_id BIGINT NOT NULL COMMENT '调度ID',
    latitude DECIMAL(10,7) NOT NULL COMMENT '纬度',
    longitude DECIMAL(10,7) NOT NULL COMMENT '经度',
    location VARCHAR(200) COMMENT '位置描述（可选，选点后反向填充或手动填写）',
    record_time DATETIME NOT NULL COMMENT '记录时间',
    INDEX idx_dispatch_id (dispatch_id),
    INDEX idx_dispatch_time (dispatch_id, record_time),
    CONSTRAINT fk_location_dispatch FOREIGN KEY (dispatch_id) REFERENCES dis_dispatch(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轨迹记录表';
