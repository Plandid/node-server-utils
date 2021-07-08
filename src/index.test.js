const { configure, checkServiceCreds } = require('./index');
const fs = require('fs');

let creds;

beforeAll(function() {
    creds = JSON.parse(fs.readFileSync('./testCreds.json'));
    configure(creds);
});

test("testing jest and only allowing commits if tests pass", function() {
    expect(true).toBe(true);
});

describe('testing checkServiceCreds', function() {
    test('check if our creds validate', async function() {
        expect(await checkServiceCreds(creds.serviceName, creds.serviceId)).toBeTruthy();
    });

    test('testing invalid creds', async function() {
        expect(await checkServiceCreds('dumb name', 'dumb id')).toBeFalsy();
    });
});