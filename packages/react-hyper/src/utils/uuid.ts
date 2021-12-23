import * as _ from 'lodash';

export default function generateUUID (type: string) {
    return _.uniqueId(`${type}_`);
}