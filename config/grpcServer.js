const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "proto/product.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDefinition).smartcart;

// gRPC Service Implementation
const productService = {
  GetProduct: async (call, callback) => {
    try {
      const Product = require("../models/Product");
      const product = await Product.findByPk(call.request.id);
      if (!product) {
        callback({ code: grpc.status.NOT_FOUND, message: "Product not found" });
        return;
      }
      callback(null, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        description: product.description || "",
        category: product.category || "",
        stock: product.stock || 0,
      });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  GetAllProducts: async (call, callback) => {
    try {
      const Product = require("../models/Product");
      const products = await Product.findAll();
      callback(null, {
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price),
          description: p.description || "",
          category: p.category || "",
          stock: p.stock || 0,
        })),
      });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
};

function startGrpcServer() {
  const server = new grpc.Server();
  server.addService(productProto.ProductService.service, productService);
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("❌ gRPC Server error:", err);
        return;
      }
      console.log(`⚡ gRPC Server running on port ${port}`);
    }
  );
  return server;
}

module.exports = { startGrpcServer };