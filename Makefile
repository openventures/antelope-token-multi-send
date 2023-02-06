CONTRACT=tknmultisend

all: $(CONTRACT).wasm $(CONTRACT).abi $(CONTRACT).opt.wasm

%.opt.wasm: %.wasm
	wasm-opt  -Oz -o $@ $<

%.wasm: src/%.cpp
	eosio-cpp -Os -I./include -o $@ $<

%.abi: src/%.cpp
	eosio-abigen -contract $(CONTRACT) -output $@ $<

clean:
	rm -f $(CONTRACT).wasm $(CONTRACT).abi $(CONTRACT).opt.wasm
