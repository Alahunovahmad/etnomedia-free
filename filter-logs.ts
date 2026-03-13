// Фильтрация логов в development режиме
if (process.env.NODE_ENV === 'development') {
  const originalConsoleLog = console.log
  console.log = (...args) => {
    const message = args.join(' ')
    // Фильтруем логи watch-progress batch запросов
    if (message.includes('/api/watch-progress/batch')) {
      return // Не выводим эти логи
    }
    originalConsoleLog(...args)
  }
}
