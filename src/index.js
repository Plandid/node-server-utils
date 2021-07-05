const axios = require('axios');
const process = require('process');

/* module variables */

let jwtKeys = {};
let serviceIdMap = {};

/* helper functions */

function useFilter(req, pathFilter, recordFilter) {
    let filter = {};
    let record = {};

    for (const key in req.params) {
        filter[key] = pathFilter.hasOwnProperty(key) ? pathFilter[key](req.params[key]) : req.params[key];
    }

    for (const key in req.query) {
        record[key] = recordFilter.hasOwnProperty(key) ? recordFilter[key](req.query[key]) : req.query[key];
    }

    for (const key in req.body) {
        record[key] = recordFilter.hasOwnProperty(key) ? recordFilter[key](req.body[key]) : req.body[key];
    }

    return {filter: filter, record: record};
}

async function getService() {
    let variables = {};
    try {
        const res = await axios.get(new URL(`services/${process.env.SERVICE_ID}`, process.env.APPDATA_DRIVER_URL).href, {
            headers: {Authorization: `Basic ${getPlandidAuthToken()}`}
        });
        variables = res.data;
    } catch (error) {
        console.error("couldn't fetch environment");
        console.error(error);
    }
    return variables ? variables : {};
}

async function getClients() {
    let variables = {};
    try {
        const res = await axios.get(new URL(`clients`, process.env.APPDATA_DRIVER_URL).href, {
            headers: {Authorization: `Basic ${getPlandidAuthToken()}`}
        });
        variables = res.data;
    } catch (error) {
        console.error("couldn't fetch environment");
        console.error(error);
    }
    return variables ? variables : {};
}

async function getEnvironment() {
    let variables = {};
    try {
        const res = await axios.get(new URL(`services/${process.env.SERVICE_ID}`, process.env.APPDATA_DRIVER_URL).href, {
            headers: {Authorization: `Basic ${getPlandidAuthToken()}`}
        });
        variables = res.data.environmentVariables;
    } catch (error) {
        console.error("couldn't fetch environment");
        console.error(error);
    }
    return variables ? variables : {};
}

async function updateJwtKeys() {
    const service = await getService();
    const clients = await getClients();
    let newKeys = {};
    
    for (const client of clients) {
        if (service.supportedClients.hasOwnProperty(client.name)) {
            jwtKeys[client.name] = client.jwtKey;
        }
    }

    jwtKeys = newKeys;
}

async function updateServiceIdMap() {
    let newMap = {};
    const res = await axios.get(new URL("services", process.env.APPDATA_DRIVER_URL).href, {
        headers: {Authorization: `Basic ${getPlandidAuthToken()}`}
    });
    
    for (const service of res.data) {
        newMap[service.name] = service._id;
    }

    serviceIdMap = newMap;
}

/* exported functions */

async function checkServiceCreds(serviceName, serviceId) {
    if (serviceIdMap.hasOwnProperty(serviceName) && serviceIdMap[serviceName] === serviceId) {
        return true;
    } else {
        await updateServiceIdMap();
        return serviceIdMap.hasOwnProperty(serviceName) && serviceIdMap[serviceName] === serviceId;
    }
}

async function createAuthToken(username, password) {
    return Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
}

async function updateEnvironment() {
    Object.assign(process.env, await getEnvironment());
}

module.exports = {
    checkServiceCreds: checkServiceCreds,
    createAuthToken: createAuthToken,
    updateEnvironment: updateEnvironment
};