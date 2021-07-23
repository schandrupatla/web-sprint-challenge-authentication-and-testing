const request = require("supertest");
const db = require("../data/dbConfig");
const server = require("./server");
const User = require("./users/users-model");
const bcrypt = require('bcryptjs')

// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
})
beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
}); 

afterAll(async () => {
  await db.destroy() 
}) 

describe('[POST] /api/auth/register', () => {
  test('responds with status code 201', async () => {
    const res = await request(server).post('/api/auth/register').send({
      username: 'sri', password:"1234"
    })
    expect(res.status).toBe(201)
  })
  
  test('saves the user with a bcrypted password instead of plain text', async () => {
    await request(server).post('/api/auth/register').send({ username: 'smith', password: '1234' })
    const res = await db('users').where('username', 'smith').first()
    expect(bcrypt.compareSync('1234', res.password)).toBeTruthy()
  })
  test('responds with the correct user not in db)', async () => {
    const res = await request(server).post('/api/auth/register').send({ username: 'akhil', password: '1234' })
    expect(res.body).toMatchObject({ id: 3, username: 'akhil' })
  })
  // test('responds with newly created user', async () => {
  //    await request(server).post('/api/auth/register').send({
  //     username: 'sri', password:"1234"
  //   })
  //   const res = await db('users').where('username', 'sri').first()
  //   expect(res.body).toMatchObject({ id: 4, username: 'sri'})
  // })
})


describe('[POST] /api/auth/login', () => {
  test('responds with the correct message on valid credentials', async () => {
    const res = await request(server).post('/api/auth/login').send({
      username: 'sri', password:"1234"
    })
    expect(res.body.message).toMatch(/welcome, sri/i)
  })
  test('responds with the correct status and message on invalid credentials', async () => {
    let res = await request(server).post('/api/auth/login').send({ username: 'bob', password: '1234' })
    expect(res.body.message).toMatch(/invalid credentials/i)
    expect(res.status).toBe(401)
  })
})
describe('[GET] /api/jokes', () => {
  test('requests without a token are bounced with proper status and message', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.body.message).toMatch(/token required/i)
  })
  test(' requests with a valid token obtain a list of jokes', async () => {
    let res = await request(server).post('/api/auth/login').send({ username: 'sri', password: '1234' })
    let results = await request(server).get('/api/jokes').set('Authorization', res.body.token)
    expect(results.body).toMatchObject([{ 
      "id": "0189hNRf2g",
      "joke": "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."
    },
    {
      "id": "08EQZ8EQukb",
      "joke": "Did you hear about the guy whose whole left side was cut off? He's all right now."
    },
    {
      "id": "08xHQCdx5Ed",
      "joke": "Why didn’t the skeleton cross the road? Because he had no guts."
     }])
  })
})