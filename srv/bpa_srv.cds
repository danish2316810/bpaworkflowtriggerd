using { db } from '../db/bpa';

service BPAServcie {

    entity BPA as projection on db.BPA;

}