import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-8">
          <div className="text-center max-w-md">
            <h1 className="font-serif text-4xl text-stone-900 dark:text-stone-100 mb-4">Something went wrong</h1>
            <p className="font-body text-stone-500 dark:text-stone-400 mb-8">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
              className="px-6 py-3 bg-brand-500 text-white rounded-full font-body font-medium hover:bg-brand-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
