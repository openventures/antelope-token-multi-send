import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  render?: (error: Error) => ReactNode;
}>;

export default class ErrorBoundary extends Component<
  Props,
  { error: Error | undefined }
> {
  constructor(props: {}) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.error !== undefined) {
      if (this.props.render) {
        return this.props.render(this.state.error);
      }
      return (
        <div className="flex flex-col">
          <div className="mt-8 rounded-md border border-red-300 bg-red-100 px-4 py-2 text-red-900">
            Error loading: {this.state.error.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
