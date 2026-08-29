import { hash as _hash } from 'bcrypt';

const password = 'olivia';

_hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});