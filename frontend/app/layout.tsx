import Providers from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>

          {/LadyB Lux Events - Plan Your Event/}
          {/Book vendors for your perfect event/}

          {children}

          <footer className="bg-gray-800 text-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p>&copy; 2026 LadyB Lux Events. All rights reserved.</p>
            </div>
          </footer>

        </Providers>
      </body>
    </html>
  );
}
