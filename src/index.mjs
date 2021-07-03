import axios from 'axios';

/* module variables */

let jwtKeys = {};

/* helper functions */

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

/* exported functions */

export function createAuthToken(username, password) {
    return Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
}

export async function mongoCollectionMethods(router, collection, pathFilter={}, recordFilter={}) {
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

export async function getServiceIdMap() {
    let serviceIdMap = {};
    const res = await axios.get(new URL("services", process.env.APPDATA_DRIVER_URL).href, {
        headers: {Authorization: `Basic ${getPlandidAuthToken()}`}
    });
    
    for (const service of res.data) {
        serviceIdMap[service.name] = service._id;
    }

    return serviceIdMap;
}