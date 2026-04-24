-- ============================================
-- 物流管理系统 - 初始化数据脚本
-- 说明：包含角色、管理员、调度员、司机、客户、车辆、订单、调度、轨迹示例数据
-- 密码统一使用：123456（MD5加密）
-- ============================================

USE lms;

-- -------------------------------------------
-- 1. 角色数据 (sys_role)
-- -------------------------------------------

INSERT INTO sys_role (role_code, role_name, description) VALUES
('ADMIN', '管理员', '系统全部功能'),
('DISPATCHER', '调度员', '订单调度、车辆管理'),
('DRIVER', '司机', '执行运输任务'),
('CUSTOMER', '客户', '下单、查订单');

-- -------------------------------------------
-- 2. 用户数据 (sys_user)
-- 密码统一使用 123456 的 MD5 值
-- role_id: 1=ADMIN, 2=DISPATCHER, 3=DRIVER, 4=DRIVER, 5=CUSTOMER, 6=CUSTOMER
-- -------------------------------------------

-- 管理员
INSERT INTO sys_user (username, password, real_name, phone, role_id, status)
VALUES ('admin', 'E10ADC3949BA59ABBE56E057F20F883E', '系统管理员', '13800138000', 1, 1);

-- 调度员
INSERT INTO sys_user (username, password, real_name, phone, role_id, status)
VALUES ('dispatcher1', 'E10ADC3949BA59ABBE56E057F20F883E', '李调度', '13800138001', 2, 1);

-- 司机
INSERT INTO sys_user (username, password, real_name, phone, role_id, status)
VALUES ('driver1', 'E10ADC3949BA59ABBE56E057F20F883E', '张师傅', '13800138002', 3, 1);

INSERT INTO sys_user (username, password, real_name, phone, role_id, status)
VALUES ('driver2', 'E10ADC3949BA59ABBE56E057F20F883E', '王师傅', '13800138003', 4, 1);

-- 客户
INSERT INTO sys_user (username, password, real_name, phone, role_id, status)
VALUES ('customer1', 'E10ADC3949BA59ABBE56E057F20F883E', '刘先生', '13800138004', 5, 1);

INSERT INTO sys_user (username, password, real_name, phone, role_id, status)
VALUES ('customer2', 'E10ADC3949BA59ABBE56E057F20F883E', '陈女士', '13800138005', 6, 1);

-- -------------------------------------------
-- 3. 车辆数据 (veh_vehicle)
-- -------------------------------------------

-- 货车
INSERT INTO veh_vehicle (plate_number, vehicle_type, load_capacity, driver_id, status, last_location)
VALUES ('京A12345', 'TRUCK', 10.00, 3, 'IDLE', '北京市朝阳区物流园');

INSERT INTO veh_vehicle (plate_number, vehicle_type, load_capacity, driver_id, status, last_location)
VALUES ('京B67890', 'TRUCK', 15.00, 4, 'IDLE', '北京市海淀区配送中心');

-- 厢式货车
INSERT INTO veh_vehicle (plate_number, vehicle_type, load_capacity, driver_id, status, last_location)
VALUES ('京C11111', 'VAN', 5.00, NULL, 'MAINTENANCE', '北京市顺义区修理厂');

-- 皮卡
INSERT INTO veh_vehicle (plate_number, vehicle_type, load_capacity, driver_id, status, last_location)
VALUES ('京D22222', 'PICKUP', 2.00, NULL, 'IDLE', '北京市大兴区仓库');

-- -------------------------------------------
-- 4. 订单数据 (ord_order)
-- -------------------------------------------

-- 订单1：待调度状态
INSERT INTO ord_order (order_no, shipper_name, shipper_phone, shipper_address, receiver_name, receiver_phone, receiver_address, goods_type, weight, volume, status, customer_id, remark)
VALUES ('ORD202604240001', '刘先生', '13900001001', '北京市朝阳区东三环甲1号', '李先生', '13900002001', '上海市浦东新区世纪大道100号', '电子产品', 0.50, 1.20, 'PENDING', 5, '请轻拿轻放');

-- 订单2：已调度状态
INSERT INTO ord_order (order_no, shipper_name, shipper_phone, shipper_address, receiver_name, receiver_phone, receiver_address, goods_type, weight, volume, status, dispatch_id, customer_id, remark)
VALUES ('ORD202604240002', '王女士', '13900001002', '北京市海淀区中关村大街1号', '赵先生', '13900002002', '广州市天河区天河路200号', '家具', 2.00, 8.50, 'DISPATCHED', 1, 5, '需要搬运服务');

-- 订单3：运输中状态
INSERT INTO ord_order (order_no, shipper_name, shipper_phone, shipper_address, receiver_name, receiver_phone, receiver_address, goods_type, weight, volume, status, dispatch_id, customer_id, remark)
VALUES ('ORD202604240003', '陈先生', '13900001003', '北京市西城区西单大街5号', '孙先生', '13900002003', '深圳市南山区科技园南路50号', '服装', 1.50, 5.00, 'IN_TRANSIT', 2, 6, NULL);

-- 订单4：已到达状态
INSERT INTO ord_order (order_no, shipper_name, shipper_phone, shipper_address, receiver_name, receiver_phone, receiver_address, goods_type, weight, volume, status, dispatch_id, customer_id, remark)
VALUES ('ORD202604230001', '周先生', '13900001004', '北京市东城区王府井大街8号', '吴先生', '13900002004', '杭州市西湖区龙井路88号', '食品', 0.80, 2.00, 'ARRIVED', 3, 6, '冷藏食品');

-- 订单5：已签收状态
INSERT INTO ord_order (order_no, shipper_name, shipper_phone, shipper_address, receiver_name, receiver_phone, receiver_address, goods_type, weight, volume, status, dispatch_id, customer_id, remark)
VALUES ('ORD202604220001', '郑女士', '13900001005', '北京市丰台区南三环西路6号', '郑先生', '13900002005', '武汉市江汉区解放大道888号', '日用品', 3.00, 10.00, 'SIGNED', 4, 5, NULL);

-- -------------------------------------------
-- 5. 调度数据 (dis_dispatch)
-- -------------------------------------------

-- 调度1：订单2的调度，已分配
INSERT INTO dis_dispatch (dispatch_no, order_id, vehicle_id, driver_id, status, current_location, estimated_departure_time, estimated_arrival_time, remark)
VALUES ('DIS202604240001', 2, 1, 3, 'ASSIGNED', '北京市朝阳区物流园', '2026-04-25 08:00:00', '2026-04-26 18:00:00', '预计明天发车');

-- 调度2：订单3的调度，运输中
INSERT INTO dis_dispatch (dispatch_no, order_id, vehicle_id, driver_id, status, current_location, estimated_departure_time, estimated_arrival_time, actual_departure_time, remark)
VALUES ('DIS202604240002', 3, 2, 4, 'IN_TRANSIT', 'G4高速济南段', '2026-04-24 09:00:00', '2026-04-25 12:00:00', '2026-04-24 09:30:00', '货物已装车出发');

-- 调度3：订单4的调度，已到达
INSERT INTO dis_dispatch (dispatch_no, order_id, vehicle_id, driver_id, status, current_location, estimated_departure_time, estimated_arrival_time, actual_departure_time, actual_arrival_time, remark)
VALUES ('DIS202604230001', 4, 1, 3, 'ARRIVED', '杭州市西湖区龙井路88号', '2026-04-23 08:00:00', '2026-04-24 18:00:00', '2026-04-23 09:00:00', '2026-04-24 17:30:00', '已到达目的地，等待签收');

-- 调度4：订单5的调度，已签收
INSERT INTO dis_dispatch (dispatch_no, order_id, vehicle_id, driver_id, status, current_location, estimated_departure_time, estimated_arrival_time, actual_departure_time, actual_arrival_time, sign_name, remark)
VALUES ('DIS202604220001', 5, 2, 4, 'SIGNED', '武汉市江汉区解放大道888号', '2026-04-22 08:00:00', '2026-04-23 20:00:00', '2026-04-22 08:30:00', '2026-04-23 19:00:00', '郑先生', '客户已签收');

-- -------------------------------------------
-- 6. 轨迹数据 (dis_location_log)
-- 说明：seq=0为起点，按seq顺序连接形成轨迹线
-- -------------------------------------------

-- 调度2的轨迹（北京 → 济南 → 徐州 → 南京 → 广州）
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (2, 0, '北京市朝阳区物流园（装货）', '2026-04-24 09:30:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (2, 1, '天津市西青区高速入口', '2026-04-24 11:00:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (2, 2, '河北省沧州市服务区', '2026-04-24 13:30:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (2, 3, '山东省济南市历城区', '2026-04-24 16:00:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (2, 4, '山东省泰安市服务区', '2026-04-24 18:30:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (2, 5, '江苏省徐州市铜山区', '2026-04-24 21:00:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (2, 6, '安徽省蚌埠市怀远县', '2026-04-25 00:30:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (2, 7, '江苏省南京市江宁区', '2026-04-25 03:00:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (2, 8, '广东省广州市白云区（卸货）', '2026-04-25 10:00:00');

-- 调度3的轨迹（北京 → 武汉 → 深圳）
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (3, 0, '北京市西城区西单大街（装货）', '2026-04-24 09:30:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (3, 1, '河北省保定市莲池区', '2026-04-24 11:30:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (3, 2, '河南省石家庄市裕华区', '2026-04-24 14:00:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (3, 3, '河南省郑州市新郑市', '2026-04-24 17:00:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (3, 4, '湖北省武汉市江汉区', '2026-04-24 22:00:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (3, 5, '湖南省长沙市雨花区', '2026-04-25 03:00:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (3, 6, '广东省广州市天河区', '2026-04-25 08:00:00');
INSERT INTO dis_location_log (dispatch_id, seq, location, record_time) VALUES (3, 7, '广东省深圳市南山区科技园（卸货）', '2026-04-25 11:00:00');
