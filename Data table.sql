//----------customer--------//

create table customer(
    id int primary key AUTO_INCREMENT,
    name varchar(50),
    email varchar(50),
    phoneNumber varchar(15),
    password varchar(20),
    role varchar(20),
    status varchar(20),
    UNIQUE (email)
    
);
insert into customer (name,email,phoneNumber,password,role,status) values('admin','admin@gmail.com','0770000000','1234','admin','true');


//----------category--------//

create table productCategory(
    id int primary key NOT NULL AUTO_INCREMENT,
    name varchar(100)
);



//----------products--------//

create table products(
    id int primary key NOT NULL AUTO_INCREMENT,
    name varchar(100),
    categoryID int NOT NULL,
    description varchar(250),
    price int NOT NULL,
    status varchar(20),
    photo varchar(200)
);


create table bill(
    id int primary key NOT NULL AUTO_INCREMENT,
    uuid varchar(200) NOT NULL,
    name varchar (200) NOT NULL,
    email varchar(100) NOT NULL,
    phoneNumber varchar(20) NOT NULL,
    paymentMethod varchar(50) NOT NULL,
    total int NOT NULL,
    productsDetails JSON DEFAULT NULL,
    createdBy varchar(200) NOT NULL,
    path varchar(200)
);

create table cart(
  id int primary key NOT NULL AUTO_INCREMENT,
  dateUser DATETIME,
  nameUser varchar(200) NOT NULL,
  addressUser varchar(200) NOT NULL,
  numberUser varchar(200) NOT NULL,
  cartList JSON DEFAULT NULL,
  total int NOT NULL,
  status varchar(200)
);