import { Test, TestingModule } from "@nestjs/testing";
import { ExternalApiService } from "./external-api.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { of, throwError } from "rxjs";
import { AxiosResponse, InternalAxiosRequestConfig, AxiosResponseHeaders } from "axios";

describe("ExternalApiService", () => {
  let service: ExternalApiService;

  // Мок для HttpService
  const mockHttpService = {
    get: jest.fn(),
  };

  // Мок для ConfigService
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "TMDB_API_KEY") return "KEY";
      if (key === "OMDB_API_KEY") return "KEY";
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalApiService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("fetchOmdbData", () => {
    it("should return fallback data if imdbId is missing", async () => {
      const result = await service.fetchOmdbData(null as any);
      expect(result.Rated).toBe("N/A");
    });

    it("should return data from API if successful", async () => {
      const mockResponse: AxiosResponse = {
        data: { Rated: "PG-13", Awards: "Oscar", Ratings: [] },
        status: 200,
        statusText: "OK",
        headers: {} as AxiosResponseHeaders,
        config: { headers: {} } as InternalAxiosRequestConfig,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchOmdbData("tt12345");

      expect(result.Rated).toBe("PG-13");
      expect(mockHttpService.get).toHaveBeenCalledWith(expect.stringContaining("apikey=KEY"));
    });

    it("should return fallback data if API throws an error", async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error("API Error")));

      const result = await service.fetchOmdbData("tt12345");

      expect(result.Rated).toBe("N/A");
      expect(result.Awards).toBe("N/A");
    });
  });

  // тестування трейлерів
  describe("fetchTrailers", () => {
    it("should return only YouTube trailers with type Trailer", async () => {
      const mockResponse: AxiosResponse = {
        data: {
          results: [
            { site: "YouTube", type: "Trailer", key: "123", name: "Trailer 1" },
            { site: "Vimeo", type: "Trailer", key: "456", name: "Vimeo Video" },
            { site: "YouTube", type: "Teaser", key: "789", name: "Teaser" },
          ],
        },
        status: 200,
        statusText: "OK",
        headers: {} as AxiosResponseHeaders,
        config: { headers: {} } as InternalAxiosRequestConfig,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchTrailers("100");

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("123");
      expect(mockHttpService.get).toHaveBeenCalledWith(expect.stringContaining("videos"));
    });
  });
});
