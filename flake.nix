{
  description = "portfolio website";

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
            echo "==============================="
            echo "Bun: $(bun --version)"
            echo "Node.js: $(node --version)"

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