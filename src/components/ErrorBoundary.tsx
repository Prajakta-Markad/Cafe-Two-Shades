import { Component, type ErrorInfo, type ReactNode, } from "react";
  
  interface Props { children: ReactNode; }
  interface State { hasError: boolean; }
  
  export default class ErrorBoundary extends Component< Props, State> {
    state: State = {
      hasError: false,
    };
  
    static getDerivedStateFromError(): State {
      return { hasError: true, };
    }
  
    componentDidCatch(
      error: Error,
      errorInfo: ErrorInfo
    ) {
      console.error(
        "Application error:",
        error,
        errorInfo
      );
    }
  
    handleReload = () => {
      window.location.reload();
    };
  
    render() {
      if (this.state.hasError) {
        return (
          <main className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-5">
            <div className="max-w-md text-center">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#8a6a22]">
                Cafe Two Shades
              </p>
  
              <h1 className="mt-4 font-serif text-3xl text-[#171512]">
                Something went wrong
              </h1>
  
              <p className="mt-4 text-sm leading-6 text-[#6b645b]">
                We're sorry, but this page could not
                be displayed correctly.
              </p>
  
              <button type="button" onClick={this.handleReload} className="mt-6 rounded-lg bg-[#171512] px-5 py-3 text-sm text-white" >
                Reload page
              </button>
            </div>
          </main>
        );
      }
  
      return this.props.children;
    }
  }