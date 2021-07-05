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
        const res = await axios.get(new URL(`services/${serviceId}`, appdataDriverUrl).href, {
            headers: {Authorization: `Basic ${createAuthToken(serviceName, serviceId)}`}
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
        const res = await axios.get(new URL(`clients`, appdataDriverUrl).href, {
            headers: {Authorization: `Basic ${createAuthToken(serviceName, serviceId)}`}
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
        const res = await axios.get(new URL(`services/${serviceId}`, appdataDriverUrl).href, {
            headers: {Authorization: `Basic ${createAuthToken(serviceName, serviceId)}`}
        });
        variables = res.data.environmentVariables;
    } catch (error) {
        console.error("couldn't fetch environment");
        console.error(error);
    }
    return variables ? variables : {};
}

async function updateJwtKeys(credentials) {
    const service = await getService(serviceName, serviceId, appdataDriverUrl);
    const clients = await getClients(serviceName, serviceId, appdataDriverUrl);
    let newKeys = {};
    
    for (const client of clients) {
        if (service.supportedClients.hasOwnProperty(client.name)) {
            jwtKeys[client.name] = client.jwtKey;
        }
    }

    jwtKeys = newKeys;
}

async function updateServiceIdMap(credentials) {
    let newMap = {};
    const res = await axios.get(new URL("services", appdataDriverUrl).href, {
        headers: {Authorization: `Basic ${createAuthToken(serviceName, serviceId)}`}
    });
    
    for (const service of res.data) {
        newMap[service.name] = service._id;
    }

    serviceIdMap = newMap;
}

/* exported functions */

async function checkServiceCreds(credentials) {
    if (serviceIdMap.hasOwnProperty(serviceName) && serviceIdMap[serviceName] === serviceId) {
        return true;
    } else {
        await updateServiceIdMap(serviceName, serviceId, appdataDriverUrl);
        return serviceIdMap.hasOwnProperty(serviceName) && serviceIdMap[serviceName] === serviceId;
    }
}

function createAuthToken(username, password) {
    return Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
}

async function updateEnvironment(environment, credentials) {
    Object.assign(environment, await getEnvironment(serviceName, serviceId, appdataDriverUrl));
}

module.exports = {
    checkServiceCreds: checkServiceCreds,
    createAuthToken: createAuthToken,
    updateEnvironment: updateEnvironment,
    useFilter: useFilter
};