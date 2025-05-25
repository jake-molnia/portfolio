{
  description = "Portfolio Website - Bun + Next.js 15 + Tailwind";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Core tools
            bun
            nodejs_24
            
            # Development utilities
            git
          ];

          shellHook = ''
            echo "🎨 Portfolio Website Development"
            echo "==============================="
            echo "Bun: $(bun --version)"
            echo "Node.js: $(node --version)"
            echo ""
            echo "Commands:"
            echo "  bun dev    - Start development server"
            echo "  bun build  - Build for production"
            echo ""
            
            # Create project structure if it doesn't exist
            mkdir -p {src/{app,components,lib},public}
            
            # Install dependencies if package.json exists
            if [ -f package.json ] && [ ! -d node_modules ]; then
              echo "📦 Installing dependencies..."
              bun install
            fi
          '';
        };
      });
}