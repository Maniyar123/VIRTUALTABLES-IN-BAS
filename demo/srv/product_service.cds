using { demo as db } from '../db/product';

service CatlogService {
entity PRODUCT as projection on db.product;
entity virtual_table as projection on db.VIRTUALTAB;

}