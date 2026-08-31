/**
 * Secure Prisma Studio launcher.
 * Validates that the caller is an ADMIN before opening the database UI.
 *
 * Usage:  pnpm exec tsx prisma/studio.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createInterface } from 'readline';
import { spawn } from 'child_process';

const prisma = new PrismaClient();

function prompt(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (hidden && process.stdin.isTTY) {
      // Suppress echo for password
      process.stdout.write(question);
      process.stdin.setRawMode(true);
      let value = '';
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      const handler = (char: string) => {
        if (char === '\r' || char === '\n') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', handler);
          process.stdout.write('\n');
          rl.close();
          resolve(value);
        } else if (char === '\u0003') {
          // Ctrl-C
          process.exit(1);
        } else if (char === '\u007f') {
          // Backspace
          if (value.length > 0) value = value.slice(0, -1);
        } else {
          value += char;
        }
      };
      process.stdin.on('data', handler);
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

async function main() {
  console.log('\n🔒  Prisma Studio — Admin Access Required\n');

  const email = await prompt('Email: ');
  const password = await prompt('Password: ', true);

  const user = await prisma.user.findUnique({
    where: { email: email.trim() },
    select: { id: true, role: true, passwordHash: true, firstName: true, lastName: true },
  });

  await prisma.$disconnect();

  if (!user) {
    console.error('\n❌  Invalid credentials.\n');
    process.exit(1);
  }

  if (user.role !== 'ADMIN') {
    console.error(`\n❌  Access denied. Only ADMIN users can open Prisma Studio (your role: ${user.role}).\n`);
    process.exit(1);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    console.error('\n❌  Invalid credentials.\n');
    process.exit(1);
  }

  console.log(`\n✅  Authenticated as ${user.firstName} ${user.lastName} (ADMIN)`);
  console.log('🚀  Starting Prisma Studio on http://localhost:5555 …\n');

  const studio = spawn('npx', ['prisma', 'studio'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
  });

  studio.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
