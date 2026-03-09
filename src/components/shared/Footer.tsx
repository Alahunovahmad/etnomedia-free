export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-red-600 mb-4">ETNOMEDIA</h3>
            <p className="text-gray-400 text-sm">
              Онлайн-кинотеатр с лучшими фильмами и сериалами. 
              Смотрите где угодно и когда угодно.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Фильмы</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Новинки</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Популярные</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Жанры</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Поддержка</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Помощь</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Контакты</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">О нас</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © 2024 ETNOMEDIA. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
