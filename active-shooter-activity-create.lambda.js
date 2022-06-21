const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = "active-shooter-activities";

exports.handler = async (event) => {
    try {
        let result;
        switch (event.routeKey) {
        case "POST /":
            return await create(event);
        case "GET /":
            return await list();
        case "GET /{id}":
            return await getById(event);
        case "DELETE /{id}":
            return await deleteById(event);
        default:
            return {
                statusCode: 404,
            };
        }
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        };
    }
};

const create = async (event) => {
    if (String(event.headers['content-type']).toLowerCase() !== 'application/json') {
        return {
            statusCode: 415
        }
    }

    const body = JSON.parse(event.body);
    const { date, shooter, location, type, calibers } = body;
    const newEntity = { date, shooter, location, type, calibers };
    
    if (Object.values(newEntity).includes(undefined)) {
        return {
            statusCode: 400,
            body: JSON.stringify("missing value")
        };
    }

    newEntity._id = Math.floor(Math.random()*10_000_000_000_000).toString();

    await dynamo.put({
        TableName: tableName,
        Item: newEntity
    }).promise();
    return {
        statusCode: 201,
        body: JSON.stringify(newEntity)
    };
}

const list = async () => {
    const result = await dynamo.scan({
        TableName: tableName
    })
    .promise();
    return {
        statusCode: 200,
        body: JSON.stringify(result.Items),
    };
}

const getById = async (event) => {
    const result = await dynamo.get({
        TableName: tableName,
        Key: { _id: event.pathParameters.id }
    })
    .promise();
    return {
        statusCode: 200,
        body: JSON.stringify(result),
    };
}

const deleteById = async (event) => {
    await dynamo.delete({
        TableName: tableName,
        Key: {
            "_id": event.pathParameters.id
        }
    })
    .promise();
    return {
        statusCode: 200
    }
}