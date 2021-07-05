const axios = require('axios');

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

async function getService(credentials) {
    let variables = {};
    try {
        const res = await axios.get(new URL(`services/${credentials.serviceId}`, credentials.appdataDriverUrl).href, {
            headers: {Authorization: `Basic ${createAuthToken(credentials.serviceName, credentials.serviceId)}`}
        });
        variables = res.data;
    } catch (error) {
        console.error("couldn't fetch environment");
        console.error(error);
    }
    return variables ? variables : {};
}

async function getClients(credentials) {
    let variables = {};
    try {
        const res = await axios.get(new URL(`clients`, credentials.appdataDriverUrl).href, {
            headers: {Authorization: `Basic ${createAuthToken(credentials.serviceName, credentials.serviceId)}`}
        });
        variables = res.data;
    } catch (error) {
        console.error("couldn't fetch environment");
        console.error(error);
    }
    return variables ? variables : {};
}

async function getEnvironment(credentials) {
    let variables = {};
    try {
        const res = await axios.get(new URL(`services/${credentials.serviceId}`, credentials.appdataDriverUrl).href, {
            headers: {Authorization: `Basic ${createAuthToken(credentials.serviceName, credentials.serviceId)}`}
        });
        variables = res.data.environmentVariables;
    } catch (error) {
        console.error("couldn't fetch environment");
        console.error(error);
    }
    return variables ? variables : {};
}

async function updateJwtKeys(credentials) {
    const service = await getService(credentials.serviceName, credentials.serviceId, credentials.appdataDriverUrl);
    const clients = await getClients(credentials.serviceName, credentials.serviceId, credentials.appdataDriverUrl);
    let newKeys = {};
    
    for (const client of clients) {
        if (service.supportedClients.hasOwnProperty(client.name)) {
            jwtKeys[client.name] = client.jwtKey;
        }
    }

    jwtKeys = newKeys;
}

async function updateserviceIdMap(credentials) {
    let newMap = {};
    const res = await axios.get(new URL("services", credentials.appdataDriverUrl).href, {
        headers: {Authorization: `Basic ${createAuthToken(credentials.serviceName, credentials.serviceId)}`}
    });
    
    for (const service of res.data) {
        newMap[service.name] = service._id;
    }

    serviceIdMap = newMap;
}

/* exported functions */

async function checkServiceCreds(serviceName, serviceId, credentials) {
    if (serviceIdMap.hasOwnProperty(serviceName) && serviceIdMap[serviceName] === serviceId) {
        return true;
    } else {
        await updateserviceIdMap(credentials.serviceName, credentials.serviceId, credentials.appdataDriverUrl);
        return serviceIdMap.hasOwnProperty(serviceName) && serviceIdMap[serviceName] === serviceId;
    }
}

function createAuthToken(username, password) {
    return Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
}

async function updateEnvironment(environment, credentials) {
    Object.assign(environment, await getEnvironment(credentials.serviceName, credentials.serviceId, credentials.appdataDriverUrl));
}

module.exports = {
    checkServiceCreds: checkServiceCreds,
    createAuthToken: createAuthToken,
    updateEnvironment: updateEnvironment,
    useFilter: useFilter
};