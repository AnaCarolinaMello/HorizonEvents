CREATE DATABASE HorizonEvents;
USE HorizonEvents;

CREATE TABLE Usuario_Cliente(
Id int unsigned auto_increment not null,
Nome varchar(80) not null,
User_Name varchar(80) not null,
Email varchar(80) not null,
Telefone char(13),
Foto_Perfil blob,
Senha char(32) not null,
Primary key(Id)
)Engine=INNODB;

CREATE TABLE Usuario_Empresa(
CNPJ char(20) not null,
Razao_Social varchar(100) not null,
Nome_Fantasia varchar(90) not null,
Descricao varchar(255),
Website varchar(100),
Foto_Perfil blob,
Imagem_Demostrativa1 blob,
Imagem_Demostrativa2 blob,
Imagem_Demostrativa3 blob,
Email varchar(80) not null,
Telefone char(15) not null,
Rua varchar(80) not null,
Bairro varchar(80) not null,
Cidade varchar(80) not null,
UF char(2) not null,
CEP char(10) not null,
Senha char(32) not null,
primary key(CNPJ)
)Engine=INNODB;

CREATE TABLE Favoritos(
Id int unsigned auto_increment not null,
Usuario_Id int unsigned not null,
Empresa_CNPJ char(20) not null,
primary key(id),
foreign key(Usuario_Id) references Usuario_Cliente(Id),
foreign key(Empresa_CNPJ) references Usuario_Empresa(CNPJ)
)Engine=INNODB;

