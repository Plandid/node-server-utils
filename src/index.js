const axios = require("axios");

// not exported

function objectMatchesTemplate(obj, template, typeCheck=false) {
    const notValid = typeCheck ? 
        function(key) { return !(key in obj) || !(typeof template[key] === typeof obj[key]) } :
        function(key) { return !(key in obj) }
    
    for (const key in template) {
        if (notValid(key)) {
            return false;
        }
    }

    return true;
}

function generateAuthToken(username, password) {
    return Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
}

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

async function simpleDatabaseMethods(router, collection, pathFilter={}, recordFilter={}) {
    router.get("/:_id", async function(req, res, next) {
        try {
            const { filter } = useFilter(req, pathFilter, {});
            let data = await collection.find(filter);
            data = await data.count() > 1 ? await data.toArray() : await data.next();
            res.json(data);
        } catch (error) {
            next(error);
        }
    });

    router.post("/", async function(req, res, next) {
        try {
            const { record } = useFilter(req, {}, recordFilter);
            await collection.insertOne(record);
        
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });

    router.post("/:_id", async function(req, res, next) {
        try {
            const { filter, record } = useFilter(req, pathFilter, recordFilter);
            await collection.insertOne({ ...filter, ...record });
        
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });

    router.put("/:_id", async function(req, res, next) {
        try {
            const { filter, record } = useFilter(req, pathFilter, recordFilter);
            await collection.replaceOne(filter, { ...filter, ...record }, { upsert: true });
        
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });

    router.patch("/:_id", async function(req, res, next) {
        try {
            const { filter, record } = useFilter(req, pathFilter, recordFilter);
            await collection.updateOne(filter, {$set: record});
        
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });

    router.delete("/:_id", async function(req, res, next) {
        try {
            const { filter } = useFilter(req, pathFilter, {});
            await collection.deleteOne(filter);
        
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });
}

function checkForClientError(req, options) {
    let message = "";

    if ("pathParams" in options && !objectMatchesTemplate(req.params, options.pathParams, options.typeCheck)) message += `\nInvalid path parameters. Expected Format:\n${JSON.stringify(options.pathParams)}\n`;
    if ("queryParams" in options && !objectMatchesTemplate(req.query, options.queryParams, options.typeCheck)) message += `\nInvalid query parameters. Expected Format:\n${JSON.stringify(options.queryParams)}\n`;
    if ("headers" in options && !objectMatchesTemplate(req.headers, options.headers, options.typeCheck)) message += `\nInvalid header parameters. Expected Format:\n${JSON.stringify(options.headers)}\n`;
    if ("body" in options && !objectMatchesTemplate(req.body, options.body, options.typeCheck)) message += `\nInvalid JSON body. Expected Format:\n${JSON.stringify(options.body)}\n`;

    if (message.length > 0) {
        throw message;
    }
}

async function getServiceIdMap() {
    let serviceIdMap = {};
    const res = await axios.get(new URL("services", process.env.APPDATA_DRIVER_URL).href, {
        headers: {Authorization: `Basic ${getPlandidAuthToken()}`}
    });
    
    for (const service of res.data) {
        serviceIdMap[service.name] = service._id;
    }

    return serviceIdMap;
}

async function getClientIdMap() {
    let clientIdMap = {};
    const res = await axios.get(new URL("clients", process.env.APPDATA_DRIVER_URL).href, {
        headers: {Authorization: `Basic ${getPlandidAuthToken()}`}
    });
    
    for (const service of res.data) {
        clientIdMap[service.name] = service._id;
    }

    return clientIdMap;
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

async function assignEnvironment() {
    Object.assign(process.env, await getEnvironment());
}

module.exports = {
    objectMatchesTemplate: objectMatchesTemplate,
    generateAuthToken: generateAuthToken,
    simpleDatabaseMethods: simpleDatabaseMethods,
    checkForClientError: checkForClientError,
    getServiceIdMap: getServiceIdMap,
    getClientIdMap: getClientIdMap,
    assignEnvironment: assignEnvironment
}