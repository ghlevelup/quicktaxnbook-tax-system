import request from 'supertest';
import app from '../api/index';

(async () => {
  const health = await request(app).get('/v1/health');
  console.log('HEALTH:', health.status);

  const login = await request(app)
    .post('/v1/auth/login')
    .send({
      email: process.env.PLATFORM_OWNER_EMAIL,
      password: process.env.PLATFORM_OWNER_PASSWORD,
    });
  console.log('LOGIN:', login.status, login.body.data?.user?.accountRole);

  const token = login.body.data?.tokens?.access?.token;
  const me = await request(app).get('/v1/me').set('Authorization', `Bearer ${token}`);
  console.log('ME:', me.status, me.body.data?.email);

  const ok = health.status === 200 && login.status === 200 && me.status === 200;
  process.exit(ok ? 0 : 1);
})();
