import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Конфигурация Prisma 7.
 * Этот файл заменяет прямое указание URL в schema.prisma.
 */
export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // Используем утилиту env для безопасного получения строки подключения
    url: env("DATABASE_URL"),
  },
});