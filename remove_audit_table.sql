-- SQL скрипт для удаления таблицы audit_logs из базы данных
-- Выполните этот скрипт в PostgreSQL для удаления таблицы аудита

-- Удаление таблицы audit_logs
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Проверка, что таблица удалена
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'audit_logs';
-- Должно вернуть пустой результат

